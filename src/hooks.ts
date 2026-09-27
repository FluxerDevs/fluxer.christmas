import type { Reroute } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

/** Deployment base path ('' or e.g. '/fluxer.christmas' on GitHub Pages). */
const base = resolve('/').slice(0, -1);

export const reroute: Reroute = (request) => {
	// Paraglide doesn't know about the base path: strip it, de-localize, then put it back.
	const url = new URL(request.url);
	url.pathname = url.pathname.slice(base.length) || '/';
	return base + deLocalizeUrl(url).pathname;
};
