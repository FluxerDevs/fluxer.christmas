/**
 * Typed access to runtime configuration. Values are read on every access (not at
 * import), so the same build works with whatever the container is started with.
 */
import { randomBytes } from 'node:crypto';
import { env } from '$env/dynamic/private';

const flag = (value: string | undefined, fallback: boolean) =>
	value === undefined || value === '' ? fallback : /^(1|true|yes|on)$/i.test(value);

let devSecret: string | undefined;

export const config = {
	/** Public URL of the site, used for OAuth redirects and invite links. */
	get origin() {
		return (env.ORIGIN || 'http://localhost:4321').replace(/\/$/, '');
	},
	get clientId() {
		return env.FLUXER_CLIENT_ID || '1555762697700651008';
	},
	get clientSecret() {
		return env.FLUXER_CLIENT_SECRET ?? '';
	},
	/** Fluxer instance origin that serves `/.well-known/fluxer`; every other URL comes from there. */
	get fluxerInstance() {
		return (env.FLUXER_INSTANCE || 'https://canary.fluxer.com').replace(/\/$/, '');
	},
	/** Fluxer user IDs allowed in while the work-in-progress gate is on. */
	get whitelist() {
		return new Set(
			(env.FLUXER_WHITELIST ?? '')
				.split(/[\s,]+/)
				.map((id) => id.trim())
				.filter(Boolean)
		);
	},
	/** Temporary gate: only whitelisted, logged-in users see the experience. On unless disabled. */
	get requireLogin() {
		return flag(env.REQUIRE_LOGIN, true);
	},
	get dataDir() {
		return env.DATA_DIR || 'data';
	},
	/** HMAC key for signed tokens (invite join tickets). */
	get sessionSecret() {
		if (env.SESSION_SECRET) return env.SESSION_SECRET;
		if (process.env.NODE_ENV === 'production')
			throw new Error('SESSION_SECRET must be set in production');
		devSecret ??= randomBytes(32).toString('hex');
		return devSecret;
	}
};
