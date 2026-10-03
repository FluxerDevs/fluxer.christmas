/**
 * Minimal Fluxer API client: instance discovery, the OAuth2 code grant and the two
 * user routes this app needs. Base URLs always come from `/.well-known/fluxer`.
 */
import { config } from './env';

export interface FluxerEndpoints {
	api_public: string;
	media: string;
	static_cdn: string;
	webapp: string;
}

export interface FluxerTokens {
	access_token: string;
	refresh_token: string;
	expires_in: number;
	scope: string;
}

export interface FluxerUser {
	id: string;
	username: string;
	global_name: string | null;
	avatar: string | null;
}

export interface FluxerGuild {
	id: string;
	name: string;
	icon: string | null;
}

export const SCOPES = ['identify', 'guilds'] as const;

const USER_AGENT = 'fluxer.christmas (https://fluxer.christmas)';
const DISCOVERY_TTL = 60 * 60 * 1000;

export class FluxerError extends Error {
	constructor(
		readonly status: number,
		/** OAuth2 `error` or API error `code`, when the body had one. */
		readonly code: string | undefined,
		message: string
	) {
		super(message);
	}
}

const trim = (url: string) => url.replace(/\/$/, '');

let discovery: { at: number; endpoints: FluxerEndpoints } | undefined;

export async function endpoints(): Promise<FluxerEndpoints> {
	if (discovery && Date.now() - discovery.at < DISCOVERY_TTL) return discovery.endpoints;
	try {
		const response = await fetch(`${config.fluxerInstance}/.well-known/fluxer`, {
			headers: { 'user-agent': USER_AGENT, accept: 'application/json' }
		});
		if (!response.ok) throw new Error(`discovery returned ${response.status}`);
		const body = (await response.json()) as { endpoints: FluxerEndpoints };
		const { api_public, media, static_cdn, webapp } = body.endpoints;
		discovery = {
			at: Date.now(),
			endpoints: {
				api_public: trim(api_public),
				media: trim(media),
				static_cdn: trim(static_cdn),
				webapp: trim(webapp)
			}
		};
		return discovery.endpoints;
	} catch (error) {
		// A stale answer beats no login at all while the instance hiccups.
		if (discovery) return discovery.endpoints;
		throw error;
	}
}

async function readError(response: Response) {
	const text = await response.text();
	try {
		const body = JSON.parse(text) as {
			error?: string;
			error_description?: string;
			code?: string;
			message?: string;
		};
		return new FluxerError(
			response.status,
			body.error ?? body.code,
			body.error_description ?? body.message ?? text
		);
	} catch {
		return new FluxerError(response.status, undefined, text || response.statusText);
	}
}

export function redirectUri() {
	return `${config.origin}/callback`;
}

export async function authorizeUrl(state: string, codeChallenge: string) {
	const { webapp } = await endpoints();
	const url = new URL(`${webapp}/oauth2/authorize`);
	url.search = new URLSearchParams({
		client_id: config.clientId,
		scope: SCOPES.join(' '),
		redirect_uri: redirectUri(),
		response_type: 'code',
		state,
		code_challenge: codeChallenge,
		code_challenge_method: 'S256'
	}).toString();
	return url.toString();
}

async function oauthPost(path: string, fields: Record<string, string>) {
	if (!config.clientSecret) throw new Error('FLUXER_CLIENT_SECRET is not set');
	const { api_public } = await endpoints();
	return fetch(`${api_public}/v1/oauth2/${path}`, {
		method: 'POST',
		headers: {
			'user-agent': USER_AGENT,
			'content-type': 'application/x-www-form-urlencoded',
			accept: 'application/json'
		},
		body: new URLSearchParams({
			client_id: config.clientId,
			client_secret: config.clientSecret,
			...fields
		})
	});
}

async function tokenRequest(fields: Record<string, string>): Promise<FluxerTokens> {
	const response = await oauthPost('token', fields);
	if (!response.ok) throw await readError(response);
	return (await response.json()) as FluxerTokens;
}

export function exchangeCode(code: string, codeVerifier: string) {
	return tokenRequest({
		grant_type: 'authorization_code',
		code,
		redirect_uri: redirectUri(),
		code_verifier: codeVerifier
	});
}

export function refreshTokens(refreshToken: string) {
	return tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
}

/** Ends the grant. Best effort: the session is gone locally whatever Fluxer answers. */
export async function revokeRefreshToken(refreshToken: string) {
	try {
		await oauthPost('token/revoke', { token: refreshToken, token_type_hint: 'refresh_token' });
	} catch {
		// Ignore network failures on logout.
	}
}

async function api<T>(accessToken: string, path: string): Promise<T> {
	const { api_public } = await endpoints();
	const response = await fetch(`${api_public}/v1${path}`, {
		headers: {
			'user-agent': USER_AGENT,
			authorization: `Bearer ${accessToken}`,
			accept: 'application/json'
		}
	});
	if (!response.ok) throw await readError(response);
	return (await response.json()) as T;
}

export async function getCurrentUser(accessToken: string): Promise<FluxerUser> {
	const user = await api<FluxerUser>(accessToken, '/users/@me');
	return {
		id: user.id,
		username: user.username,
		global_name: user.global_name ?? null,
		avatar: user.avatar ?? null
	};
}

export async function getCurrentUserGuilds(accessToken: string): Promise<FluxerGuild[]> {
	const guilds = await api<FluxerGuild[]>(accessToken, '/users/@me/guilds?limit=200');
	return guilds.map(({ id, name, icon }) => ({ id, name, icon: icon ?? null }));
}

/** Six built-in avatars, picked by user ID, for accounts without one. */
const DEFAULT_AVATAR_COUNT = 6n;

export async function avatarUrl(user: Pick<FluxerUser, 'id' | 'avatar'>, size = 128) {
	const { media, static_cdn } = await endpoints();
	if (!user.avatar) return `${static_cdn}/avatars/${BigInt(user.id) % DEFAULT_AVATAR_COUNT}.png`;
	const hash = user.avatar.replace(/^a_/, '');
	return `${media}/avatars/${user.id}/${hash}.webp?size=${size}`;
}

export async function guildIconUrl(guild: FluxerGuild, size = 256) {
	if (!guild.icon) return null;
	const { media } = await endpoints();
	const hash = guild.icon.replace(/^a_/, '');
	return `${media}/icons/${guild.id}/${hash}.webp?size=${size}`;
}
