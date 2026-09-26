import { expect, test, type Page } from '@playwright/test';
import { mockSignedInApp } from './support/mockSupabase';

/** Signed-in app pages against a mocked Supabase: each must render with no console errors. */

function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.beforeEach(async ({ page }) => {
  await mockSignedInApp(page);
});

const PAGES = [
  { path: '/app', heading: /Good (morning|afternoon|evening), Nadia!/ },
  { path: '/app/mood', heading: 'Mood' },
  { path: '/app/journal', heading: 'Daily journal' },
  { path: '/app/community', heading: 'The Adda' },
  { path: '/app/coaching', heading: 'Find your mentor' },
  { path: '/app/arcade', heading: 'The Arcade' },
  { path: '/app/toolkit', heading: 'Career toolkit' },
  { path: '/app/resources', heading: 'Get help' },
];

for (const { path, heading } of PAGES) {
  test(`${path} renders without errors`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('dashboard shows database XP, streak and quests', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByText('120 / 500 XP to next level')).toBeVisible();
  await expect(page.getByText('Read one self-care article')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark done' })).toBeVisible();
});

test('practitioner directory links out and is labelled as not affiliated', async ({ page }) => {
  await page.goto('/app/coaching');
  await page.getByRole('tab', { name: 'Find a professional' }).click();
  const book = page.getByRole('link', { name: /Book on example\.org/ });
  await expect(book).toHaveAttribute('href', 'https://example.org/book');
  await expect(book).toHaveAttribute('target', '_blank');
  await expect(page.getByText('Not affiliated with Bondhu').first()).toBeVisible();
});

test('demo mentors are labelled fictional and open a booking dialog', async ({ page }) => {
  await page.goto('/app/coaching');
  await expect(page.getByText('Fictional demo mentor')).toBeVisible();
  await page.getByRole('button', { name: 'Book a session' }).click();
  await expect(page.getByRole('dialog', { name: 'Book with Farhana Akter' })).toBeVisible();
});

test('community like toggles instantly and comments open', async ({ page }) => {
  await page.goto('/app/community');
  const like = page.getByRole('button', { name: /Like \(34 likes\)/ });
  await like.click();
  await expect(page.getByRole('button', { name: /Like \(35 likes\)/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: '1 comment' }).click();
  await expect(page.getByText('Podcasts help!')).toBeVisible();
});

test('app pages work in Bangla', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('bondhu-lang', 'bn'));
  await page.goto('/app/resources');
  await expect(page.getByRole('heading', { level: 1, name: 'সাহায্য নিন' })).toBeVisible();
  await expect(page.getByRole('link', { name: '999-এ কল করুন' })).toHaveAttribute(
    'href',
    'tel:999',
  );
});

const GAMES = [
  { slug: 'shapla-breath', title: 'Shapla Breath' },
  { slug: 'bubble-pop', title: 'Bubble Pop Calm' },
  { slug: 'rickshaw-memory', title: 'Rickshaw Memory Match' },
  { slug: 'shobdo', title: 'Shobdo (শব্দ)' },
  { slug: 'nouka-drift', title: 'Nouka Drift' },
  { slug: 'kantha-canvas', title: 'Kantha Canvas' },
];

for (const { slug, title } of GAMES) {
  test(`arcade game ${slug} loads with its leaderboard`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/app/arcade');
    await page.getByRole('link', { name: title }).click();
    await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
    await expect(page.getByText('Calm Koel')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sound off' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('bubble pop counts pops from mouse and keyboard', async ({ page }) => {
  await page.goto('/app/arcade/bubble-pop');
  await page.getByRole('button', { name: 'Bubble 1, 1', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Bubble 1, 1 (popped)' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Bubble 1, 2 (popped)' })).toBeVisible();
  await expect(page.getByText('2 / 48')).toBeVisible();
});

test('rickshaw memory flips cards and counts moves', async ({ page }) => {
  await page.goto('/app/arcade/rickshaw-memory');
  await page.getByRole('button', { name: 'Card 1, face down' }).click();
  await page.getByRole('button', { name: 'Card 2, face down' }).click();
  await expect(page.getByText('Moves1')).toBeVisible();
});

test('shobdo accepts typed guesses and colours the tiles', async ({ page }) => {
  await page.addInitScript(() => localStorage.removeItem('bondhu-shobdo'));
  await page.goto('/app/arcade/shobdo');
  await expect(page.getByRole('heading', { level: 1, name: 'Shobdo (শব্দ)' })).toBeVisible();
  await page.keyboard.type('crane');
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('img', { name: /^C, (correct|in the word|not in the word)$/ }),
  ).toBeVisible();
  await page.getByRole('radio', { name: 'বাংলা' }).click();
  await expect(page.getByRole('button', { name: 'ক', exact: true })).toBeVisible();
});

test('kantha canvas draws with the pointer and adds motifs from the keyboard', async ({ page }) => {
  await page.goto('/app/arcade/kantha-canvas');
  await expect(page.getByRole('heading', { level: 1, name: 'Kantha Canvas' })).toBeVisible();
  const undo = page.getByRole('button', { name: 'Undo' });
  await expect(undo).toBeDisabled();
  await page.keyboard.press('g');
  await expect(undo).toBeEnabled();
});

test('shapla breath runs, pauses and resumes', async ({ page }) => {
  await page.goto('/app/arcade/shapla-breath');
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Breathe in', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByText('Paused', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByText('Paused', { exact: true })).toBeHidden();
});
