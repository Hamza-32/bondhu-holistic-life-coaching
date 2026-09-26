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

test('the app is protected: signed-out visitors are sent to sign in', async ({ page }) => {
  const errors = trackConsoleErrors(page);
  await page.goto('/app/journal');

  await expect(page).toHaveURL(/\/login\?next=%2Fapp%2Fjournal$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Welcome back' })).toBeVisible();
  await expect(page).toHaveTitle(/Sign in · Bondhu/);

  await page.goto('/onboarding');
  await expect(page).toHaveURL(/\/login\?next=%2Fonboarding$/);

  expect(errors).toEqual([]);
});

test('landing CTAs lead to sign-up and sign-in', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Get started free' }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Create your account' })).toBeVisible();

  await page.goto('/');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog').getByRole('link', { name: 'Sign in' }).click();
  } else {
    await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
  }
  await expect(page).toHaveURL(/\/login$/);
});

test('sign-up validates input before contacting the server', async ({ page }) => {
  await page.goto('/signup');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('Tell us what to call you.')).toBeVisible();
  await expect(page.getByText('Enter a valid email address.')).toBeVisible();

  await page.getByLabel('Your name').fill('Nadia');
  await page.getByLabel('Email').fill('nadia@example.com');
  await page.getByLabel('Password', { exact: true }).fill('onlyletters');
  await page.getByLabel('Confirm password').fill('different1');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('Include at least one letter and one number.')).toBeVisible();
  await expect(page.getByText("Passwords don't match.")).toBeVisible();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
});

test('sign-in offers password and email-link methods', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();

  await page.getByRole('button', { name: 'Email link' }).click();
  await expect(page.getByRole('button', { name: 'Email me a sign-in link' })).toBeVisible();

  await page.getByRole('button', { name: 'Password', exact: true }).click();
  await page.getByRole('link', { name: 'Forgot password?' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Reset your password' })).toBeVisible();
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

  // Unknown app routes are behind auth too.
  await page.goto('/app/nope');
  await expect(page).toHaveURL(/\/login/);
});

test('the page never scrolls horizontally', async ({ page }) => {
  for (const path of ['/', '/login', '/signup', '/definitely-not-a-page']) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});
