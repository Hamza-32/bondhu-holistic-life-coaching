import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes } from 'react-router';
import '@/lib/i18n';
import { App } from '@/app/App';
import { routes } from '@/app/router';

// The pre-Supabase MVP kept journals and mood data in localStorage. That data is not migrated
// (docs/ARCHITECTURE.md §6.1): remove it so it never lingers on shared devices.
try {
  localStorage.removeItem('bondhu-storage');
  localStorage.removeItem('bondhu-last-user');
} catch {
  // Storage unavailable (e.g. private mode): nothing to clean up.
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

/**
 * The landing page ships prerendered (scripts/prerender.ts). Hydrate it in place so the painted
 * HTML is reused (no flash, no second Largest Contentful Paint). Every other route renders fresh.
 */
async function start(root: HTMLElement) {
  const prerendered = root.hasChildNodes();
  if (prerendered) {
    // Load this URL's lazy route modules first, so the first client render matches the HTML.
    const matches = matchRoutes(routes, window.location) ?? [];
    await Promise.all(
      matches.map(async ({ route }) => {
        if (typeof route.lazy !== 'function') return;
        const loaded = await route.lazy();
        Object.assign(route, loaded, { lazy: undefined });
      }),
    );
  }
  // Reads the hydration data the prerender embedded (window.__staticRouterHydrationData).
  const router = createBrowserRouter(routes);
  const app = (
    <StrictMode>
      <App router={router} />
    </StrictMode>
  );
  if (prerendered) hydrateRoot(root, app);
  else createRoot(root).render(app);
  // src/boot.ts holds clicks while prerendered controls have no React handlers. Event delegation
  // is installed once hydrateRoot returns, so interaction can safely resume here.
  root.style.removeProperty('pointer-events');
}

void start(rootElement);
