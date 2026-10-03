import { getDb } from '$lib/server/db';

/** Liveness/readiness probe: the server is up and the database answers. */
export function GET() {
	getDb().prepare('SELECT 1').get();
	return new Response('ok', { headers: { 'cache-control': 'no-store' } });
}
