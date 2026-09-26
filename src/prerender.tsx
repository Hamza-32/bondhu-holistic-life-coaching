/**
 * Build-time prerender of the public landing page (SSR entry, see scripts/prerender.ts).
 * Renders `/` through the real route tree so the static HTML matches the first client render;
 * the browser then hydrates it (src/main.tsx).
 */
import { renderToString } from 'react-dom/server';
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from 'react-router';
import '@/lib/i18n';
import { AppProviders } from '@/app/providers/AppProviders';
import { routes } from '@/app/router';

export async function render(url: string): Promise<string> {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(new URL(url, 'http://localhost')));
  if (context instanceof Response) throw new Error(`Unexpected redirect while prerendering ${url}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(
    <AppProviders>
      <StaticRouterProvider router={router} context={context} hydrate />
    </AppProviders>,
  );
}
