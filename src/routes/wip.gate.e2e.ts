import { expect, test } from '@playwright/test';
import { E2E_TESTER, logIn } from '../../e2e/fixtures';

test('visitors see the work-in-progress screen instead of the room', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Work in progress')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Join the community' })).toHaveAttribute(
		'href',
		'https://fluxer.gg/dh9m2Iqo'
	);
	await expect(page.getByRole('link', { name: 'Log in with Fluxer' })).toBeVisible();
	await expect(page.locator('canvas')).toHaveCount(0);
});

test('logged-in users off the whitelist are told so', async ({ page, context, baseURL }) => {
	await logIn(context, baseURL!, { id: '900000000000000002', name: 'Outsider' });
	await page.goto('/');
	await expect(page.getByText("You're logged in as Outsider")).toBeVisible();
	await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
	await expect(page.locator('canvas')).toHaveCount(0);
});

test('whitelisted users get the room', async ({ page, context, baseURL }) => {
	await logIn(context, baseURL!, { id: E2E_TESTER, name: 'Tester' });
	await page.goto('/');
	await expect(page.getByText('Work in progress')).toHaveCount(0);
	await expect(page.locator('canvas')).toBeVisible();
	await expect(page.getByText('Tester')).toBeVisible();
});
