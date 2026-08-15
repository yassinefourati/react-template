import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('login with valid credentials navigates to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'admin@demo.com');
    await page.fill('[name=password]', 'password');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'wrong@demo.com');
    await page.fill('[name=password]', 'wrongpass');
    await page.click('button[type=submit]');
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText('Forgot password')).toBeVisible();
  });

  test('protected route redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL('/login');
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', 'admin@demo.com');
    await page.fill('[name=password]', 'password');
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/');
    await page.getByRole('img', { name: 'A' }).click();
    await page.getByText('Logout').click();
    await expect(page).toHaveURL('/login');
  });
});
