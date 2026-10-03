import { redirect } from '@sveltejs/kit';
import { endSession } from '$lib/server/session';
import type { RequestHandler } from './$types';

/** POST only, so a link or image elsewhere can't log people out. */
export const POST: RequestHandler = async ({ cookies }) => {
	await endSession(cookies);
	redirect(303, '/');
};
