import { Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { envResult } from '@/lib/env';

/** Shown instead of auth screens when Supabase env vars are missing or invalid. */
export function SetupNotice() {
  const { t } = useTranslation();
  const steps = ['step1', 'step2', 'step3'] as const;

  return (
    <div role="alert" className="mx-auto max-w-md px-4 py-16">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Database className="size-6" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-bold">{t('auth.setup.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('auth.setup.body')}</p>
      <ol className="mt-6 list-decimal space-y-2 pl-5">
        {steps.map((s) => (
          <li key={s}>{t(`auth.setup.${s}`)}</li>
        ))}
      </ol>
      {!envResult.ok && (
        <details className="mt-6 rounded-lg bg-muted p-4 text-sm">
          <summary className="cursor-pointer font-medium">{t('auth.setup.details')}</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs text-muted-foreground">
            {envResult.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
