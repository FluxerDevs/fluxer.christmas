/**
 * Per-login state kept in a short-lived cookie between `/login` and `/callback`:
 * the CSRF `state`, the PKCE verifier and where to send the user afterwards.
 */
import { createHash, randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { cookieOptions } from './session';

const COOKIE = 'oauth_login';

interface LoginState {
	state: string;
	verifier: string;
	returnTo: string;
}

/** Only same-site paths, so the callback can't be turned into an open redirect. */
export function safeReturnTo(value: string | null | undefined) {
	return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
		? value
		: '/';
}

export function beginLogin(cookies: Cookies, returnTo: string) {
	const login: LoginState = {
		state: randomBytes(16).toString('base64url'),
		verifier: randomBytes(32).toString('base64url'),
		returnTo: safeReturnTo(returnTo)
	};
	cookies.set(COOKIE, JSON.stringify(login), { ...cookieOptions(), maxAge: 10 * 60 });
	const challenge = createHash('sha256').update(login.verifier).digest('base64url');
	return { state: login.state, challenge };
}

/** Reads and clears the pending login; undefined when missing or the state doesn't match. */
export function finishLogin(cookies: Cookies, state: string | null): LoginState | undefined {
	const raw = cookies.get(COOKIE);
	cookies.delete(COOKIE, { path: '/' });
	if (!raw || !state) return undefined;
	try {
		const login = JSON.parse(raw) as LoginState;
		return login.state === state ? login : undefined;
	} catch {
		return undefined;
	}
}
