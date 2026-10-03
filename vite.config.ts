import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

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

			// Static build for GitHub Pages (see .github/workflows/deploy.yml).
			adapter: adapter({ fallback: '404.html' }),
			paths: {
				// Set by CI: '' for a custom domain, '/<repo>' for <user>.github.io/<repo>.
				base: (process.env.BASE_PATH ?? '') as '' | `/${string}`,
				// Absolute URLs so `resolve('/')` yields the real base path (used by the i18n reroute).
				relative: false
			}
		}),

		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true
		})
	]
});
