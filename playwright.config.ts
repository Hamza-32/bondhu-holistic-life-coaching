import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // The PWA service worker would bypass page.route() mocks.
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    // Placeholder project: the app boots signed-out without network access. Journeys that need a
    // real backend run against a Supabase test project in CI (Phase 7).
    env: {
      VITE_SUPABASE_URL: process.env.E2E_SUPABASE_URL ?? 'https://e2e-placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY:
        process.env.E2E_SUPABASE_ANON_KEY ?? 'e2e-placeholder-publishable-key',
    },
  },
});
