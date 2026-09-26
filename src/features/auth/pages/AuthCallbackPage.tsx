import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context';
import { safeNextPath } from '../redirect';

/** How long to wait for Supabase to exchange the link's code before showing an error. */
const EXCHANGE_TIMEOUT_MS = 8000;

/** Landing point for magic links, email confirmation and Google OAuth. */
export function AuthCallbackPage() {
  const { t } = useTranslation();
  const { state } = useAuth();
  const [params] = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);
  const linkError = params.get('error_description') ?? params.get('error');

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), EXCHANGE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  if (state.status === 'signedIn') {
    return <Navigate to={safeNextPath(params.get('next'))} replace />;
  }

  // "Signed out" alone is not final here: the code exchange may still be in flight.
  if (linkError || timedOut) {
    return (
      <div role="alert" className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-coral-soft text-coral">
          <AlertTriangle className="size-7" aria-hidden />
        </div>
        <p className="mt-6 text-muted-foreground">{t('auth.callback.failed')}</p>
        <Button asChild className="mt-8 h-11 w-full">
          <Link to="/login">{t('auth.callback.retry')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div role="status" className="flex flex-col items-center gap-4 text-muted-foreground">
      <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
      {t('auth.callback.working')}
    </div>
  );
}

export default AuthCallbackPage;
