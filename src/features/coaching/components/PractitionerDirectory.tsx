import { useMemo, useState } from 'react';
import { ExternalLink, Info, MapPin, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { currentLanguage } from '@/lib/i18n';
import { useDivisions } from '@/features/reference/api';
import { usePractitioners, type Practitioner } from '../api';

const PROFESSIONS = [
  'all',
  'psychiatrist',
  'clinical_psychologist',
  'counselling_psychologist',
  'counsellor',
] as const;

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

function PractitionerCard({
  p,
  divisionName,
}: {
  p: Practitioner;
  divisionName: string | undefined;
}) {
  const { t } = useTranslation();
  return (
    <li className="flex flex-col rounded-2xl border bg-card p-5 shadow-soft">
      <p className="text-xs font-semibold text-primary uppercase">
        {t(`coaching.professions.${p.profession}` as 'coaching.professions.psychiatrist')}
      </p>
      <h3 className="mt-1 text-lg font-semibold">{p.full_name}</h3>
      <p className="text-sm text-muted-foreground">{p.title}</p>
      {p.credentials && <p className="mt-1 text-xs text-muted-foreground">{p.credentials}</p>}
      <p className="mt-3 text-sm font-medium">{p.organization}</p>
      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="size-3.5" aria-hidden />
        {[p.city, divisionName].filter(Boolean).join(', ')}
      </p>
      {p.specialties.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {p.specialties.slice(0, 4).map((s) => (
            <li key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">
              {s}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-5">
        <a
          href={p.booking_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary px-4 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {t('coaching.directory.bookExternal', { site: hostOf(p.booking_url) })}
          <ExternalLink className="size-4" aria-hidden />
          <span className="sr-only">{t('common.opensNewTab')}</span>
        </a>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          {t('coaching.directory.notAffiliated')} ·{' '}
          <a
            href={p.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            {t('coaching.directory.verified', { date: formatDate(p.verified_at) })}
          </a>
        </p>
      </div>
    </li>
  );
}

/** Real mental-health professionals' public listings (build plan rule 8 amendment). */
export function PractitionerDirectory() {
  const { t } = useTranslation();
  const practitioners = usePractitioners();
  const divisions = useDivisions();
  const [profession, setProfession] = useState<(typeof PROFESSIONS)[number]>('all');
  const [division, setDivision] = useState('all');

  const divisionName = (slug: string | null) => {
    const d = divisions.data?.find((x) => x.slug === slug);
    if (!d) return undefined;
    return currentLanguage() === 'bn' ? d.name_bn : d.name_en;
  };

  const filtered = useMemo(
    () =>
      (practitioners.data ?? []).filter(
        (p) =>
          (profession === 'all' || p.profession === profession) &&
          (division === 'all' || p.division_slug === division),
      ),
    [practitioners.data, profession, division],
  );
  const availableDivisions = [
    ...new Set((practitioners.data ?? []).map((p) => p.division_slug).filter(Boolean)),
  ];

  const selectClass =
    'h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none';

  return (
    <div className="space-y-6">
      <div className="flex gap-3 rounded-2xl border border-primary/20 bg-secondary/60 p-4 text-sm">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">{t('coaching.directory.disclaimerTitle')}</p>
          <p className="text-muted-foreground">{t('coaching.directory.disclaimer')}</p>
        </div>
      </div>
      <div className="flex gap-3 rounded-2xl border border-coral/30 bg-coral-soft p-4 text-sm">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
        <p>
          {t('coaching.directory.emergency')}{' '}
          <a href="tel:999" className="font-semibold text-coral underline">
            999
          </a>
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">{t('coaching.directory.profession')}</span>
          <select
            className={selectClass}
            value={profession}
            onChange={(e) => setProfession(e.target.value as typeof profession)}
          >
            {PROFESSIONS.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? t('coaching.directory.all') : t(`coaching.professions.${p}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium">{t('coaching.directory.division')}</span>
          <select
            className={selectClass}
            value={division}
            onChange={(e) => setDivision(e.target.value)}
          >
            <option value="all">{t('coaching.directory.all')}</option>
            {availableDivisions.map((slug) => (
              <option key={slug} value={slug ?? ''}>
                {divisionName(slug) ?? slug}
              </option>
            ))}
          </select>
        </label>
      </div>

      {practitioners.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="hidden h-72 lg:block" />
        </div>
      ) : practitioners.isError ? (
        <p className="text-destructive">{t('common.loadFailed')}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          {t('coaching.directory.none')}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PractitionerCard key={p.id} p={p} divisionName={divisionName(p.division_slug)} />
          ))}
        </ul>
      )}
    </div>
  );
}
