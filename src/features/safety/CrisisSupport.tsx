import { useDeferredValue, useState } from 'react';
import { HeartHandshake, Phone, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { detectCrisis } from './crisis';
import { EMERGENCY_NUMBER, SupportLines } from './HelpNow';

/**
 * Gentle support card shown beside a text field when the text suggests the writer may be in
 * crisis. It never blocks saving or posting and nothing is reported anywhere.
 */
export function CrisisSupport({ text }: { text: string }) {
  const { t } = useTranslation();
  const deferred = useDeferredValue(text);
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  const flagged = detectCrisis(deferred);

  // Dismissal lasts until the text changes into a new match.
  if (!flagged || dismissedFor === deferred) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="relative mt-3 rounded-2xl border border-coral/30 bg-coral-soft p-4"
    >
      <button
        type="button"
        onClick={() => setDismissedFor(deferred)}
        className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:bg-background/60"
        aria-label={t('safety.crisisDismiss')}
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="flex gap-3 pr-6">
        <HeartHandshake className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="font-semibold">{t('safety.crisisTitle')}</p>
            <p className="mt-1 text-sm">{t('safety.crisisBody')}</p>
          </div>
          <a
            href={`tel:${EMERGENCY_NUMBER}`}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-coral px-4 text-sm font-semibold text-coral-foreground hover:bg-coral/90"
          >
            <Phone className="size-4" aria-hidden />
            {t('help.call', { number: EMERGENCY_NUMBER })} · {t('safety.emergency')}
          </a>
          <SupportLines limit={3} />
          <p className="text-xs text-muted-foreground">{t('safety.crisisPrivacy')}</p>
          <button
            type="button"
            onClick={() => setDismissedFor(deferred)}
            className="text-xs font-medium underline"
          >
            {t('safety.crisisDismiss')}
          </button>
        </div>
      </div>
    </aside>
  );
}
