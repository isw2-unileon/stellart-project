import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabasePrivateKey = process.env.VITE_SUPABASE_SECRET_KEY as string;

const supabaseAdmin = createClient(supabaseUrl, supabasePrivateKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

test.describe('Auth flow test from (login and register)', () => {

    const testEmail = "testEmail@ejemplo.com"
    const testPassword = "testPassword"
    let userId: string;

    // Create user before testing.
    test.beforeAll(async () => {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true, // Confirmation bypass
        user_metadata: {
            name: 'Usuario de E2E',
        }
        });

        if (error) {
        throw new Error(`Error creando usuario de prueba en Supabase: ${error.message}`);
        }
        
        // Save the ID from the recent user.
        userId = data.user.id;
    });

    // Delete the created user after testing.
    test.afterAll(async () => {
        if (userId) {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (error) {
            console.error('Error limpiando el usuario de prueba:', error.message);
        }
        }
    });

    // Executed before every individual test.
    test.beforeEach(async ({ page }) => {
        await page.goto('/login'); 
    });

    test('User can login correctly', async ({ page }) => {
        await page.getByPlaceholder('Email').fill(testEmail);
        await page.getByPlaceholder('Password').fill(testPassword);

        await page.getByRole('button', { name: 'Step in' }).click();

        await page.waitForResponse(response => response.url().includes('supabase') && response.status() === 200);

        await page.goto('/profile');

        // Check if the user credentials are shown in the profile page.
        await expect(page.getByText('testEmail@ejemplo.com')).toBeVisible();
    });

    test('User cannot login with incorrect password', async ({ page }) => {
        await page.getByPlaceholder('Email').fill(testEmail);
        await page.getByPlaceholder('Password').fill('contrasenia_falsa_123');

        await page.getByRole('button', { name: 'Step in' }).click();

        await expect(page).toHaveURL(/.*\/login/);

        await expect(page.getByText('Invalid login credentials')).toBeVisible();
    });
});