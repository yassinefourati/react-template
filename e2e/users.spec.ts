import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@demo.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  await page.goto('/users');
});

test.describe('Users CRUD', () => {
  test('users table loads with data', async ({ page }) => {
    await expect(page.getByText('Alice Martin')).toBeVisible();
  });

  test('opens add user dialog', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Add User')).toBeVisible();
  });

  test('creates a new user', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();
    await page.fill('[name=name]', 'Test User');
    await page.fill('[name=email]', 'test@demo.com');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByText('User created')).toBeVisible();
  });

  test('opens confirm dialog before deleting user', async ({ page }) => {
    const deleteButtons = page.getByRole('button', { name: '' }).filter({ has: page.locator('svg') });
    await deleteButtons.last().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Delete user')).toBeVisible();
  });
});
