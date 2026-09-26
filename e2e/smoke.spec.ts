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

test('landing page renders every section with verified sources', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your everyday companion');
  await expect(page).toHaveTitle(/Home · Bondhu/);

  for (const name of [
    'Small daily habits. Real support.',
    'Start in under a minute',
    'Most people in Bangladesh never get mental health care',
    'Built with care, not hype',
    'Questions, answered',
  ]) {
    await expect(page.getByRole('heading', { level: 2, name })).toBeAttached();
  }

  // Statistics must link to their primary source; the emergency button must dial 999.
  await expect(page.getByRole('link', { name: 'Read the WHO release' })).toHaveAttribute(
    'href',
    /who\.int\/bangladesh/,
  );
  await expect(page.getByRole('link', { name: 'Call 999' })).toHaveAttribute('href', 'tel:999');

  expect(errors).toEqual([]);
});

test('FAQ items expand', async ({ page }) => {
  await page.goto('/');
  const question = page.getByRole('button', { name: 'Can Bondhu replace therapy?' });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/qualified mental health professional/)).toBeVisible();
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
  await expect(page.getByRole('heading', { level: 1 })).toContainText('প্রতিদিনের সঙ্গী');

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
