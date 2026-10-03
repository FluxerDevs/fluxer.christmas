import type { Handle, ServerInit } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getDb } from '$lib/server/db';
import { getSession, SESSION_COOKIE } from '$lib/server/session';
import { registerWebSockets } from '$lib/server/websocket';

export const init: ServerInit = () => {
	// Fail fast on a broken data volume instead of on the first login.
	getDb();
	// Placeholder until multiplayer lands: greet and keep the socket open.
	registerWebSockets((socket) => socket.send(JSON.stringify({ type: 'hello', v: 1 })));
};

const handleSession: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	const session = await getSession(token);
	// A cookie for a session that no longer exists: drop it.
	if (token && !session) event.cookies.delete(SESSION_COOKIE, { path: '/' });
	event.locals.session = session;
	event.locals.user = session?.user ?? null;
	return resolve(event);
};

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

export const handle: Handle = sequence(handleSession, handleParaglide);
