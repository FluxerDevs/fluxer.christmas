import { redirect } from '@sveltejs/kit';
import { exchangeCode, getCurrentUser } from '$lib/server/fluxer';
import { finishLogin } from '$lib/server/oauth-state';
import { createSession, upsertUser } from '$lib/server/session';
import type { RequestHandler } from './$types';

/** Where Fluxer sends the browser after the consent screen. */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const login = finishLogin(cookies, url.searchParams.get('state'));
	const code = url.searchParams.get('code');

	const fail = (reason: 'denied' | 'expired' | 'failed') => {
		const target = new URL(login?.returnTo ?? '/', url);
		target.searchParams.set('login_error', reason);
		return redirect(303, target.pathname + target.search);
	};

	// Cancelled on the consent screen.
	if (url.searchParams.has('error')) fail('denied');
	// The login cookie expired or doesn't match this callback.
	if (!login || !code) return fail('expired');

	try {
		const tokens = await exchangeCode(code, login.verifier);
		const user = await getCurrentUser(tokens.access_token);
		upsertUser(user);
		createSession(cookies, user.id, tokens);
	} catch (error) {
		console.error('Fluxer login failed:', error);
		fail('failed');
	}

	redirect(303, login.returnTo);
};
