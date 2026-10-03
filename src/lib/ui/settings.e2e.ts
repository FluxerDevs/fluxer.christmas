import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	// The keyboard listeners attach once the page has hydrated.
	await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
});

test('key labels follow the layout the player types with', async ({ page }) => {
	// An AZERTY keyboard sends key "z" from the physical W position.
	await page.evaluate(() => {
		window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW', key: 'z' }));
		window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW', key: 'z' }));
	});
	await page.getByRole('button', { name: 'Settings' }).click();
	const forward = page.getByRole('listitem').filter({ hasText: 'Forward' });
	await expect(forward.getByRole('button').first()).toHaveText('Z');
});

test('controls can be rebound and the binding is remembered', async ({ page }) => {
	await page.getByRole('button', { name: 'Settings' }).click();
	const forward = page.getByRole('listitem').filter({ hasText: 'Forward' });
	await forward.getByRole('button').first().click();
	await expect(forward.getByRole('button').first()).toHaveText('Press a key…');
	await page.keyboard.press('KeyI');
	await expect(forward.getByRole('button').first()).toHaveText('I');

	await page.reload();
	await page.getByRole('button', { name: 'Settings' }).click();
	await expect(
		page.getByRole('listitem').filter({ hasText: 'Forward' }).getByRole('button').first()
	).toHaveText('I');
});

test('Escape cancels rebinding without closing the dialog', async ({ page }) => {
	await page.getByRole('button', { name: 'Settings' }).click();
	const forward = page.getByRole('listitem').filter({ hasText: 'Forward' });
	await forward.getByRole('button').first().click();
	await page.keyboard.press('Escape');
	await expect(forward.getByRole('button').first()).toHaveText('W');
	await expect(page.getByRole('dialog')).toBeVisible();
});
