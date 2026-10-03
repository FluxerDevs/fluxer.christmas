import { canEnter } from '$lib/server/access';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({ allowed: canEnter(locals.user) });
