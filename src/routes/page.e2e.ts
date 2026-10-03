import { expect, test } from '@playwright/test';

test('home page shows the start overlay', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});
