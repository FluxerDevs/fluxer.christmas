// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '$lib/server/session';
import type { SessionUser } from '$lib/types';

declare global {
	/** True in the static GitHub Pages build (`DEPLOY_TARGET=static`), where there's no server. */
	const __STATIC_SITE__: boolean;

	namespace App {
		// interface Error {}
		interface Locals {
			/** Server-only: includes the Fluxer access token. */
			session: Session | null;
			user: SessionUser | null;
		}
		interface PageData {
			user: SessionUser | null;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
