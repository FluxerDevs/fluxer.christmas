/**
 * Login sessions. The browser holds a random token in an httpOnly cookie; the
 * database stores only its SHA-256, next to the user's Fluxer tokens, which never
 * leave the server.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import type { SessionUser } from '$lib/types';
import { getDb } from './db';
import { config } from './env';
import {
	avatarUrl,
	FluxerError,
	refreshTokens,
	revokeRefreshToken,
	type FluxerTokens,
	type FluxerUser
} from './fluxer';

export const SESSION_COOKIE = 'session';

const DAY = 24 * 60 * 60 * 1000;
/** Fluxer refresh tokens live 30 days, and each refresh starts a new 30 days. */
const SESSION_LIFETIME = 30 * DAY;
/** Refresh the access token once it has less than this left. */
const REFRESH_MARGIN = DAY;

export interface Session {
	id: string;
	user: SessionUser;
	accessToken: string;
}

interface SessionRow {
	id: string;
	user_id: string;
	access_token: string;
	refresh_token: string | null;
	access_expires_at: number;
	expires_at: number;
	username: string;
	global_name: string | null;
	avatar: string | null;
}

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export function cookieOptions() {
	return {
		path: '/',
		httpOnly: true,
		sameSite: 'lax' as const,
		secure: config.origin.startsWith('https://'),
		maxAge: SESSION_LIFETIME / 1000
	};
}

export function upsertUser(user: FluxerUser) {
	const now = Date.now();
	getDb()
		.prepare(
			`INSERT INTO users (id, username, global_name, avatar, created_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?)
			 ON CONFLICT (id) DO UPDATE SET
			   username = excluded.username,
			   global_name = excluded.global_name,
			   avatar = excluded.avatar,
			   updated_at = excluded.updated_at`
		)
		.run(user.id, user.username, user.global_name, user.avatar, now, now);
}

/** Stores a new session and sets its cookie. */
export function createSession(cookies: Cookies, userId: string, tokens: FluxerTokens) {
	const token = randomBytes(32).toString('base64url');
	const now = Date.now();
	getDb()
		.prepare(
			`INSERT INTO sessions (id, user_id, access_token, refresh_token, access_expires_at, expires_at, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`
		)
		.run(
			hash(token),
			userId,
			tokens.access_token,
			tokens.refresh_token,
			now + tokens.expires_in * 1000,
			now + SESSION_LIFETIME,
			now
		);
	cookies.set(SESSION_COOKIE, token, cookieOptions());
}

function deleteRow(id: string) {
	getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
}

/** Refreshes in flight, so parallel requests don't both spend the same refresh token. */
const refreshing = new Map<string, Promise<SessionRow | undefined>>();

async function refresh(row: SessionRow): Promise<SessionRow | undefined> {
	if (!row.refresh_token) return row.access_expires_at > Date.now() ? row : undefined;
	try {
		const tokens = await refreshTokens(row.refresh_token);
		const now = Date.now();
		const updated = {
			...row,
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			access_expires_at: now + tokens.expires_in * 1000,
			expires_at: now + SESSION_LIFETIME
		};
		getDb()
			.prepare(
				`UPDATE sessions SET access_token = ?, refresh_token = ?, access_expires_at = ?, expires_at = ? WHERE id = ?`
			)
			.run(
				updated.access_token,
				updated.refresh_token,
				updated.access_expires_at,
				updated.expires_at,
				row.id
			);
		return updated;
	} catch (error) {
		if (error instanceof FluxerError && error.code === 'invalid_grant') {
			// The user revoked the app or the grant lapsed: the session is over.
			deleteRow(row.id);
			return undefined;
		}
		// Fluxer is unreachable: keep going on the current token while it lasts.
		return row.access_expires_at > Date.now() ? row : undefined;
	}
}

/** Resolves the session for a cookie value, refreshing Fluxer tokens when they near expiry. */
export async function getSession(token: string | undefined): Promise<Session | null> {
	if (!token) return null;
	const id = hash(token);
	let row = getDb()
		.prepare(
			`SELECT s.id, s.user_id, s.access_token, s.refresh_token, s.access_expires_at, s.expires_at,
			        u.username, u.global_name, u.avatar
			 FROM sessions s JOIN users u ON u.id = s.user_id
			 WHERE s.id = ?`
		)
		.get(id) as SessionRow | undefined;
	if (!row) return null;
	if (row.expires_at <= Date.now()) {
		deleteRow(id);
		return null;
	}
	if (row.access_expires_at - Date.now() < REFRESH_MARGIN) {
		let pending = refreshing.get(id);
		if (!pending) {
			pending = refresh(row).finally(() => refreshing.delete(id));
			refreshing.set(id, pending);
		}
		row = await pending;
		if (!row) return null;
	}
	return {
		id,
		accessToken: row.access_token,
		user: {
			id: row.user_id,
			username: row.username,
			displayName: row.global_name || row.username,
			avatarUrl: await avatarUrl({ id: row.user_id, avatar: row.avatar })
		}
	};
}

/** Logs out: forgets the session, ends the Fluxer grant and clears the cookie. */
export async function endSession(cookies: Cookies) {
	const token = cookies.get(SESSION_COOKIE);
	cookies.delete(SESSION_COOKIE, { path: '/' });
	if (!token) return;
	const id = hash(token);
	const row = getDb().prepare('SELECT refresh_token FROM sessions WHERE id = ?').get(id) as
		{ refresh_token: string | null } | undefined;
	deleteRow(id);
	if (row?.refresh_token) await revokeRefreshToken(row.refresh_token);
}
