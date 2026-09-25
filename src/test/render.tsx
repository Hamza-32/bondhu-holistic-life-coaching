import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { AppProviders } from '@/app/providers/AppProviders';

/** Render a component inside the app providers and an in-memory router. */
export function renderWithRouter(
  ui: ReactElement,
  { path = '/', routes = [] }: { path?: string; routes?: RouteObject[] } = {},
) {
  const router = createMemoryRouter([{ path, element: ui }, ...routes], {
    initialEntries: [path],
  });
  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    ),
  };
}
