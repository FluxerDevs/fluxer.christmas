import type { LayoutServerLoad } from './$types';

// The GitHub Pages build is fully prerendered; the Node server renders on demand.
export const prerender = __STATIC_SITE__;

export const load: LayoutServerLoad = ({ locals }) => ({ user: locals.user });
