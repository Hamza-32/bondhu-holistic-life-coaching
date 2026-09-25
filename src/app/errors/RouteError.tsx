import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import { ErrorFallback } from './ErrorFallback';

/** Route-level error element: 404 responses render the Not Found page, anything else the fallback. */
export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return <ErrorFallback error={error} onRetry={() => void navigate(0)} />;
}
