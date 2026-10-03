import { redirect } from '@sveltejs/kit';
import { authorizeUrl } from '$lib/server/fluxer';
import { beginLogin } from '$lib/server/oauth-state';
import type { RequestHandler } from './$types';

/** Starts the Fluxer OAuth2 code grant. `?returnTo=/path` picks where to land afterwards. */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const { state, challenge } = beginLogin(cookies, url.searchParams.get('returnTo') ?? '/');
	redirect(302, await authorizeUrl(state, challenge));
};
