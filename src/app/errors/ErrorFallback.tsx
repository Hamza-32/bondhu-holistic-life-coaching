import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error?: unknown;
  onRetry?: () => void;
}

function errorMessage(error: unknown): string | null {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return null;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const { t } = useTranslation();
  const message = errorMessage(error);

  return (
    <div
      role="alert"
      className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center"
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-coral-soft text-coral">
        <AlertTriangle className="size-8" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">{t('error.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('error.body')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>
            <RotateCcw aria-hidden />
            {t('error.retry')}
          </Button>
        )}
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t('error.reload')}
        </Button>
      </div>
      {import.meta.env.DEV && message && (
        <details className="mt-8 w-full rounded-lg bg-muted p-4 text-left text-sm">
          <summary className="cursor-pointer font-medium">{t('error.details')}</summary>
          <pre className="mt-2 overflow-auto whitespace-pre-wrap text-muted-foreground">
            {message}
          </pre>
        </details>
      )}
    </div>
  );
}
