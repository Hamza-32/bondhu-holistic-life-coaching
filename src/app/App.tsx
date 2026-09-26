import { RouterProvider, type createBrowserRouter } from 'react-router';
import { ErrorBoundary } from '@/app/errors/ErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';

export function App({ router }: { router: ReturnType<typeof createBrowserRouter> }) {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
