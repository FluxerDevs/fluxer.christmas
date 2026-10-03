/**
 * Shared e2e helpers: fake logged-in users are written straight into the test
 * server's SQLite database, since tests can't go through Fluxer's consent screen.
 */
import { createHash, randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { BrowserContext } from '@playwright/test';

/** Fluxer user ID on the test servers' whitelist. */
export const E2E_TESTER = '900000000000000001';

export const e2eDataDir = (port: number) => join('data', `e2e-${port}`);

/** Creates a session for a user on the server behind `baseURL` and sets its cookie. */
export async function logIn(
	context: BrowserContext,
	baseURL: string,
	user: { id: string; name: string }
) {
	const port = Number(new URL(baseURL).port);
	const db = new DatabaseSync(join(e2eDataDir(port), 'fluxer-christmas.db'));
	const now = Date.now();
	const token = randomBytes(16).toString('hex');
	db.prepare(
		`INSERT OR REPLACE INTO users (id, username, global_name, avatar, created_at, updated_at)
		 VALUES (?, ?, ?, NULL, ?, ?)`
	).run(user.id, user.name.toLowerCase(), user.name, now, now);
	db.prepare(
		`INSERT INTO sessions (id, user_id, access_token, refresh_token, access_expires_at, expires_at, created_at)
		 VALUES (?, ?, 'e2e', NULL, ?, ?, ?)`
	).run(
		createHash('sha256').update(token).digest('hex'),
		user.id,
		now + 7 * 86_400_000,
		now + 30 * 86_400_000,
		now
	);
	db.close();
	await context.addCookies([{ name: 'session', value: token, url: baseURL }]);
}
