import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';
import { ErrorFallback } from '@/app/errors/ErrorFallback';
import { PageLoader } from '@/components/PageLoader';
import { useProfile } from '@/features/profile/api';
import { useAuth } from '../context';
import { safeNextPath } from '../redirect';
import { SetupNotice } from './SetupNotice';

const ONBOARDING_PATH = '/onboarding';

/**
 * Protects every route below it: requires a session and a completed onboarding.
 * Signed-out visitors go to /login and return to where they were after signing in.
 */
export function RequireAuth() {
  const { state } = useAuth();
  const location = useLocation();
  const profile = useProfile();

  if (state.status === 'unconfigured') return <SetupNotice />;
  if (state.status === 'loading') return <PageLoader />;
  if (state.status === 'signedOut') {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (profile.isPending) return <PageLoader />;
  if (profile.isError)
    return <ErrorFallback error={profile.error} onRetry={() => void profile.refetch()} />;

  // A demo guest's sandbox is still being filled (see features/demo): wait, don't onboard.
  if (state.user.is_anonymous === true && !profile.data.is_demo) return <PageLoader />;

  const onOnboarding = location.pathname === ONBOARDING_PATH;
  if (!profile.data.onboarding_done && !onOnboarding)
    return <Navigate to={ONBOARDING_PATH} replace />;
  if (profile.data.onboarding_done && onOnboarding) return <Navigate to="/app" replace />;

  return <Outlet />;
}

/** For sign-in/sign-up pages: already signed-in users are sent on to the app. */
export function GuestOnly() {
  const { state } = useAuth();
  const [params] = useSearchParams();

  if (state.status === 'loading') return <PageLoader />;
  if (state.status === 'signedIn')
    return <Navigate to={safeNextPath(params.get('next'))} replace />;
  return <Outlet />;
}
