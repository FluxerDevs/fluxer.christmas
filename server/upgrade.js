// Bridges WebSocket upgrades from the Node HTTP server (production entry or Vite dev
// server) to the handler that SvelteKit's server code registers at startup. The two
// live in different module graphs, so they meet through a well-known global symbol.

/** @typedef {(request: import('node:http').IncomingMessage, socket: import('node:stream').Duplex, head: Buffer) => void} UpgradeHandler */

export const UPGRADE_HANDLER = Symbol.for('fluxer.christmas.upgrade');
export const WS_PATH = '/ws';

/** @param {import('node:events').EventEmitter} server An HTTP server (Node's, or Vite's). */
export function attachUpgrade(server) {
	server.on(
		'upgrade',
		/**
		 * @param {import('node:http').IncomingMessage} request
		 * @param {import('node:stream').Duplex} socket
		 * @param {Buffer} head
		 */
		(request, socket, head) => {
			const { pathname } = new URL(request.url ?? '/', 'http://localhost');
			// Anything else (such as Vite's HMR socket) is handled by its own listener.
			if (pathname !== WS_PATH) return;
			/** @type {UpgradeHandler | undefined} */
			const handler = /** @type {any} */ (globalThis)[UPGRADE_HANDLER];
			if (handler) handler(request, socket, head);
			else socket.destroy();
		}
	);
}
