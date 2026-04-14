import { test, expect } from '@playwright/test';

test('La landing page de Stellart carga correctamente', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('#root')).toBeVisible();
});