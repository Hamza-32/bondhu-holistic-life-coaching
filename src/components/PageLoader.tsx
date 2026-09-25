import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

/** Content-shaped skeleton shown while a lazy route chunk loads (no spinners on content). */
export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-8">
      <span className="sr-only">{t('app.loading')}</span>
      <Skeleton className="h-10 w-1/2 max-w-sm" />
      <Skeleton className="h-4 w-3/4 max-w-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="hidden h-40 lg:block" />
      </div>
    </div>
  );
}
