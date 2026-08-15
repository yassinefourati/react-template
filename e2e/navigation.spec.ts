import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@demo.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');
});

test.describe('Navigation', () => {
  test('navigates to Users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });

  test('navigates to Analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible();
  });

  test('navigates to Settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByText('General Settings')).toBeVisible();
  });

  test('navigates to Profile page', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText('Alice Admin')).toBeVisible();
  });

  test('navigates to Audit Log page', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: 'Audit Log' })).toBeVisible();
  });

  test('404 page shown for unknown route', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
  });
});
