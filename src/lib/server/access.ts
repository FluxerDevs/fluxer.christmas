import type { SessionUser } from '$lib/types';
import { config } from './env';

/**
 * Temporary work-in-progress gate: while `REQUIRE_LOGIN` is on, only logged-in users
 * on the `FLUXER_WHITELIST` get the experience.
 */
export function canEnter(user: SessionUser | null) {
	if (!config.requireLogin) return true;
	return user !== null && config.whitelist.has(user.id);
}
