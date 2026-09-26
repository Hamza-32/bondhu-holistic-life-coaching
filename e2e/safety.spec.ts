import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockSignedInApp } from './support/mockSupabase';

/** Phase 6: safety, privacy, polish, plus an axe accessibility scan of every page. */

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    nodes: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
  }));
  expect(summary).toEqual([]);
}

test.describe('public pages', () => {
  for (const path of ['/', '/login', '/signup', '/privacy']) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForTimeout(800); // let entrance animations settle
      await expectNoAxeViolations(page);
    });
  }

  test('the help button is available before signing in', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('button', { name: /Need help now\?|Help/ })
      .first()
      .click();
    const sheet = page.getByRole('dialog', { name: 'You are not alone' });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole('link', { name: /999/ })).toHaveAttribute('href', 'tel:999');
    await expect(sheet.getByText(/not a medical or crisis service/)).toBeVisible();
  });

  test('privacy policy is public and linked from the footer', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Privacy policy' })).toBeVisible();
    await expect(page.getByText(/Delete your account from Settings/)).toBeVisible();
  });

  test('the landing page and sign-in offer a demo', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Try the demo' })).toBeVisible();
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Try the demo' })).toBeVisible();
  });
});

test.describe('signed in', () => {
  test.beforeEach(async ({ page }) => {
    await mockSignedInApp(page);
  });

  const APP_PAGES = [
    '/app',
    '/app/mood',
    '/app/journal',
    '/app/community',
    '/app/coaching',
    '/app/arcade',
    '/app/toolkit',
    '/app/resources',
    '/app/settings',
    '/app/arcade/shobdo',
    '/app/arcade/rickshaw-memory',
    '/app/arcade/kantha-canvas',
  ];
  for (const path of APP_PAGES) {
    test(`${path} has no axe violations`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.waitForTimeout(600);
      await expectNoAxeViolations(page);
    });
  }

  test('public help page works too', async ({ page }) => {
    await page.goto('/help');
    await expect(page.getByRole('heading', { level: 1, name: 'Get help' })).toBeVisible();
  });

  test('writing about self-harm shows a gentle support card without blocking', async ({ page }) => {
    await page.goto('/app/journal');
    const body = page.getByLabel('Your thoughts');
    await body.fill('Today was long. Sometimes I want to die.');
    const card = page.getByRole('status').filter({ hasText: 'really hard' });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: /999/ })).toHaveAttribute('href', 'tel:999');
    await card.getByRole('button', { name: 'I am okay, hide this' }).first().click();
    await expect(card).toBeHidden();
    await expect(page.getByRole('button', { name: 'Save entry' })).toBeEnabled();
  });

  test('settings exports data as a JSON download', async ({ page }) => {
    await page.goto('/app/settings');
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download my data' }).click();
    expect((await download).suggestedFilename()).toMatch(/^bondhu-data-\d{4}-\d{2}-\d{2}\.json$/);
  });

  test('account deletion needs the confirmation word', async ({ page }) => {
    await page.goto('/app/settings');
    await page.getByRole('button', { name: 'Delete my account' }).click();
    const dialog = page.getByRole('dialog', { name: 'Delete your account?' });
    const confirm = dialog.getByRole('button', { name: 'Delete permanently' });
    await expect(confirm).toBeDisabled();
    await dialog.getByRole('textbox').fill('delete');
    await expect(confirm).toBeEnabled();
  });

  test('the command palette jumps to a game', async ({ page }) => {
    await page.goto('/app');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Control+k');
    await page.getByPlaceholder('Type a page, game or action…').fill('nouka');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Nouka Drift' })).toBeVisible();
  });
});
