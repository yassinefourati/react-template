import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Helper: log in and return to a given URL
async function loginAndGoto(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never, url: string) {
  await page.goto('/login');
  await page.fill('[name=email]', 'admin@demo.com');
  await page.fill('[name=password]', 'password');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/');
  if (url !== '/') await page.goto(url);
}

// Shared assertion: fail if axe finds any violations
async function expectNoA11yViolations(page: Parameters<typeof test>[1] extends (...args: infer A) => unknown ? A[0] : never) {
  const results = await new AxeBuilder({ page })
    .exclude('#webpack-dev-server-client-overlay') // dev overlay — not in prod
    .analyze();
  expect(results.violations, results.violations.map((v) => `${v.id}: ${v.description}`).join('\n')).toHaveLength(0);
}

test.describe('Accessibility', () => {
  test('login page has no violations', async ({ page }) => {
    await page.goto('/login');
    await expectNoA11yViolations(page);
  });

  test('dashboard has no violations', async ({ page }) => {
    await loginAndGoto(page, '/');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page);
  });

  test('users page has no violations', async ({ page }) => {
    await loginAndGoto(page, '/users');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page);
  });

  test('analytics page has no violations', async ({ page }) => {
    await loginAndGoto(page, '/analytics');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page);
  });

  test('settings page has no violations', async ({ page }) => {
    await loginAndGoto(page, '/settings');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page);
  });

  test('notifications page has no violations', async ({ page }) => {
    await loginAndGoto(page, '/notifications');
    await page.waitForLoadState('networkidle');
    await expectNoA11yViolations(page);
  });

  test('404 page has no violations', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expectNoA11yViolations(page);
  });
});
