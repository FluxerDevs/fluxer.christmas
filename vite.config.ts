import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import nodeAdapter from '@sveltejs/adapter-node';
import staticAdapter from '@sveltejs/adapter-static';
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

/**
 * `DEPLOY_TARGET=static` builds the static site for GitHub Pages (prerendered; no login,
 * database or multiplayer). Anything else builds the Node server for the Docker image.
 */
const STATIC_SITE = process.env.DEPLOY_TARGET === 'static';

export default defineConfig({
	define: { __STATIC_SITE__: JSON.stringify(STATIC_SITE) },
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

			adapter: STATIC_SITE
				? // GitHub Pages (see .github/workflows/deploy.yml).
					staticAdapter({ fallback: '404.html' })
				: // Node server, packaged as a Docker image (see Dockerfile and server/index.js).
					nodeAdapter()
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true
		}),

		websockets
	]
});
