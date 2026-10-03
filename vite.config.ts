import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, type Plugin } from 'vite';
import { attachUpgrade } from './server/upgrade.js';

/** Routes WebSocket upgrades on the dev server the same way `server/index.js` does in production. */
const websockets: Plugin = {
	name: 'fluxer-christmas-websockets',
	configureServer(server) {
		if (server.httpServer) attachUpgrade(server.httpServer);
	},
	configurePreviewServer(server) {
		attachUpgrade(server.httpServer);
	}
};

export default defineConfig({
	// Must match the OAuth redirect URI registered with Fluxer (http://localhost:4321/callback).
	server: { port: 4321, strictPort: true },
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Node server, packaged as a Docker image (see Dockerfile and server/index.js).
			adapter: adapter()
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true
		}),

		websockets
	]
});
