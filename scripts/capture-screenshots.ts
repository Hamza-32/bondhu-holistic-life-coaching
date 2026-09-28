/** Capture the README screenshots from a running production preview (`npm run preview`). */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium, type BrowserContext, type Page } from '@playwright/test';
import { mockSignedInApp } from '../e2e/support/mockSupabase.ts';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUTPUT = path.join(ROOT, 'docs', 'screenshots');
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? 'http://127.0.0.1:4173';

mkdirSync(OUTPUT, { recursive: true });

async function setPreferences(context: BrowserContext, theme: 'light' | 'dark') {
  await context.addInitScript((selectedTheme) => {
    localStorage.setItem('bondhu-lang', 'en');
    localStorage.setItem(
      'bondhu-ui',
      JSON.stringify({
        state: { theme: selectedTheme, soundEnabled: false, hapticsEnabled: true },
        version: 1,
      }),
    );
  }, theme);
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

const browser = await chromium.launch();

const landingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await setPreferences(landingContext, 'light');
const landing = await landingContext.newPage();
await landing.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
await landing.getByRole('heading', { level: 1 }).waitFor();
await settle(landing);
await landing.screenshot({ path: path.join(OUTPUT, 'landing-desktop-light.png') });
await landingContext.close();

const dashboardContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
await setPreferences(dashboardContext, 'dark');
const dashboard = await dashboardContext.newPage();
await mockSignedInApp(dashboard);
await dashboard.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
await dashboard.getByRole('heading', { level: 1 }).waitFor();
await settle(dashboard);
await dashboard.screenshot({ path: path.join(OUTPUT, 'dashboard-desktop-dark.png') });
await dashboardContext.close();

const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
await setPreferences(mobileContext, 'light');
const mobile = await mobileContext.newPage();
await mockSignedInApp(mobile);
await mobile.goto(`${BASE_URL}/app`, { waitUntil: 'domcontentloaded' });
await mobile.getByRole('heading', { level: 1 }).waitFor();
await settle(mobile);
await mobile.screenshot({ path: path.join(OUTPUT, 'dashboard-mobile-light.png') });
await mobileContext.close();

await browser.close();
console.log(`Wrote screenshots to ${OUTPUT}`);
