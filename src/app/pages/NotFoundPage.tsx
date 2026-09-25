import { Compass } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Compass className="size-8" aria-hidden />
      </div>
      <p className="text-sm font-semibold tracking-widest text-primary">{t('notFound.code')}</p>
      <h1 className="mt-2 text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="mt-3 text-muted-foreground">{t('notFound.body')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">{t('notFound.home')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app">{t('notFound.dashboard')}</Link>
        </Button>
      </div>
    </div>
  );
}

export default NotFoundPage;
