/**
 * WebSocket endpoint on `/ws`. The HTTP server forwards upgrades here through the
 * bridge in `server/upgrade.js`; registering happens once, from the server `init` hook.
 */
import type { IncomingMessage } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, type WebSocket } from 'ws';
import { UPGRADE_HANDLER } from '../../../server/upgrade.js';

export type ConnectionHandler = (socket: WebSocket, request: IncomingMessage) => void;

const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

export function registerWebSockets(onConnection: ConnectionHandler) {
	wss.removeAllListeners('connection');
	wss.on('connection', onConnection);
	(globalThis as Record<symbol, unknown>)[UPGRADE_HANDLER] = (
		request: IncomingMessage,
		socket: Duplex,
		head: Buffer
	) => wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
}
