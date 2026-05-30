import { test, expect } from '@playwright/test';

test.describe('Stellart Landing Page', () => {

	// INFO: Always do page.goto() before testing.
	test('should load the main page and show the correct title', async ({ page }) => {
		await page.goto('/');

		// Checks that the text "Bring out the star" is visible.
		await expect(page.getByText('Bring out the star')).toBeVisible();
		
		// Checks that the text "inside of you" is visible.
		await expect(page.getByText('inside of you')).toBeVisible();
	});

	test('the "Explore gallery" button should navigate to the /explore route', async ({ page }) => {
		await page.goto('/');

		// Finds the "Explore gallery" button and clicks it.
		await page.getByRole('button', { name: 'Explore gallery' }).click();

		// Verifies that after clicking, the current URL contains the "/explore" route.
		await expect(page).toHaveURL(/.*\/explore/);
	});

	test('the "Join For Free" button should navigate to the /register route', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', {name: 'Join For Free' }).click();

		await expect(page).toHaveURL(/.*\/register/);
	});
});