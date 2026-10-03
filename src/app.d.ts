// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Session } from '$lib/server/session';
import type { SessionUser } from '$lib/types';

declare global {
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
