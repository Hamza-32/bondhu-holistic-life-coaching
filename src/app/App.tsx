import { RouterProvider } from 'react-router';
import { ErrorBoundary } from '@/app/errors/ErrorBoundary';
import { AppProviders } from '@/app/providers/AppProviders';
import { router } from '@/app/router';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ErrorBoundary>
  );
}
