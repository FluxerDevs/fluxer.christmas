import { expect, test } from '@playwright/test';

test('login redirects to the Fluxer consent screen with PKCE', async ({ request }) => {
	const response = await request.get('/login?returnTo=/somewhere', { maxRedirects: 0 });
	expect(response.status()).toBe(302);
	const location = new URL(response.headers()['location']);
	expect(location.pathname).toBe('/oauth2/authorize');
	expect(location.searchParams.get('response_type')).toBe('code');
	expect(location.searchParams.get('scope')).toBe('identify guilds');
	expect(location.searchParams.get('redirect_uri')).toMatch(/\/callback$/);
	expect(location.searchParams.get('code_challenge_method')).toBe('S256');
	expect(location.searchParams.get('state')).toBeTruthy();
	expect(response.headers()['set-cookie']).toContain('HttpOnly');
});

test('a callback without a matching login is rejected', async ({ request }) => {
	const response = await request.get('/callback?code=x&state=forged', { maxRedirects: 0 });
	expect(response.status()).toBe(303);
	expect(response.headers()['location']).toBe('/?login_error=expired');
});

test('logging out requires POST', async ({ request }) => {
	const response = await request.get('/logout', { maxRedirects: 0 });
	expect(response.status()).toBe(405);
});
