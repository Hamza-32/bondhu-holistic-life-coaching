import { expect, test, type Page } from '@playwright/test';

/** Fail the test on any console error or uncaught exception (Definition of Done: no console errors). */
function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test('landing page renders and links into the app', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Grow stronger');
  await expect(page).toHaveTitle(/Home · Bondhu/);

  await page.getByRole('link', { name: 'Start your journey' }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole('dialog', { name: 'Welcome to Bondhu' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('onboarding leads to the dashboard and navigation works', async ({ page, isMobile }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/app');

  await page.getByLabel('What should we call you?').fill('Test User');
  await page.getByRole('button', { name: "Let's start" }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Test User');

  const nav = page.getByRole('navigation', {
    name: isMobile ? 'Mobile navigation' : 'Primary navigation',
  });
  await nav.getByRole('link', { name: 'Journal' }).click();
  await expect(page).toHaveURL(/\/app\/journal$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Daily journal' })).toBeVisible();
  await expect(page).toHaveTitle(/Journal · Bondhu/);

  expect(errors).toEqual([]);
});

test('language and theme toggles persist across reloads', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /change language/i }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('একসাথে');

  await page.getByRole('button', { name: 'থিম পরিবর্তন করুন' }).click();
  await page.getByRole('menuitemradio', { name: 'ডার্ক' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'bn');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('unknown routes show the 404 page', async ({ page }) => {
  await page.goto('/definitely-not-a-page');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();

  await page.goto('/app/nope');
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
});

test('the page never scrolls horizontally', async ({ page }) => {
  for (const path of ['/', '/app']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
