import { test, expect } from '@playwright/test';

test.describe('Landing Page de Stellart', () => {
  
  test('debería cargar la página principal y mostrar el título correcto', async ({ page }) => {
    await page.goto('/');

    // Comprueba que el texto "Bring out the star" es visible.
    await expect(page.getByText('Bring out the star')).toBeVisible();
    
    // Comprueba que el texto "inside of you" es visible.
    await expect(page.getByText('inside of you')).toBeVisible();
  });

  test('el botón "Explore gallery" debería navegar a la ruta /explore', async ({ page }) => {
    await page.goto('/');

    // Busca el botón "Explore gallery" y hace click.
    await page.getByRole('button', { name: 'Explore gallery' }).click();

    // Comprobamos que tras hacer click la url en la que estamos contiene la ruta "/explore".
    await expect(page).toHaveURL(/.*\/explore/);
  });

});