import type { Handle, ServerInit } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { getDb } from '$lib/server/db';
import { registerWebSockets } from '$lib/server/websocket';

export const init: ServerInit = () => {
	// Fail fast on a broken data volume instead of on the first login.
	getDb();
	// Placeholder until multiplayer lands: greet and keep the socket open.
	registerWebSockets((socket) => socket.send(JSON.stringify({ type: 'hello', v: 1 })));
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

export const handle: Handle = handleParaglide;
