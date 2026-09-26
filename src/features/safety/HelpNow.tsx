import { LifeBuoy, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuth } from '@/features/auth/context';
import { telHref, useHelplines } from '@/features/resources/api';
import { currentLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

/** Verified national emergency number; always shown, even offline or before data loads. */
export const EMERGENCY_NUMBER = '999';

function EmergencyCall() {
  const { t } = useTranslation();
  return (
    <a
      href={`tel:${EMERGENCY_NUMBER}`}
      className="flex items-center gap-4 rounded-2xl bg-coral p-4 text-coral-foreground hover:bg-coral/90"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
        <Phone className="size-5" aria-hidden />
      </span>
      <span>
        <span className="block text-2xl font-bold">{EMERGENCY_NUMBER}</span>
        <span className="block text-sm font-semibold">{t('safety.emergency')}</span>
        <span className="block text-xs opacity-90">{t('safety.emergencyDesc')}</span>
      </span>
    </a>
  );
}

/** Up to `limit` verified support lines (emergency excluded; it is shown separately). */
export function SupportLines({ limit = 4 }: { limit?: number }) {
  const { t } = useTranslation();
  const helplines = useHelplines();
  const bn = currentLanguage() === 'bn';
  const lines = (helplines.data ?? [])
    .filter((h) => h.category !== 'emergency' && h.number !== EMERGENCY_NUMBER)
    .slice(0, limit);
  if (lines.length === 0) return null;

  return (
    <ul className="space-y-2">
      {lines.map((h) => (
        <li key={h.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{h.name}</p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {bn ? h.description_bn : h.description_en}
            </p>
          </div>
          <a
            href={telHref(h.number)}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            aria-label={t('help.call', { number: h.number })}
          >
            <Phone className="size-3.5" aria-hidden />
            {h.number}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Persistent "Need help now?" button that opens verified helplines in a side sheet. */
export function HelpNowButton({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { state } = useAuth();
  const resourcesPath = state.status === 'signedIn' ? '/app/resources' : '/help';

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'border-coral/40 text-coral hover:bg-coral-soft hover:text-coral',
            className,
          )}
        >
          <LifeBuoy aria-hidden />
          <span className="hidden sm:inline">{t('safety.helpNow')}</span>
          <span className="sm:hidden">{t('safety.helpNowShort')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-xl">{t('safety.sheetTitle')}</SheetTitle>
          <SheetDescription>{t('safety.sheetBody')}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <EmergencyCall />
          <SupportLines />
          <Link
            to={resourcesPath}
            className="block text-center text-sm font-medium text-primary hover:underline"
          >
            {t('safety.more')}
          </Link>
          <p className="rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            {t('safety.disclaimer')}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
