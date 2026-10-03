// Production entry point: SvelteKit's Node server plus WebSocket upgrades on /ws.
// Importing the build starts the HTTP server (PORT, HOST, ORIGIN… from the environment).
import { server } from '../build/index.js';
import { attachUpgrade } from './upgrade.js';

// `server` is the adapter's Polka app; `.server` is the underlying Node HTTP server.
attachUpgrade(server.server);
