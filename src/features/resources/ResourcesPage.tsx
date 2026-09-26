import { Building2, ExternalLink, Phone, ShieldAlert, UserRoundSearch } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import { currentLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { telHref, useHelplines, useResources, useSupportOrganizations, type Helpline } from './api';

function HelplineCard({ h }: { h: Helpline }) {
  const { t } = useTranslation();
  const bn = currentLanguage() === 'bn';
  const emergency = h.category === 'emergency';
  return (
    <li
      className={cn(
        'flex flex-col rounded-2xl border bg-card p-5 shadow-soft',
        emergency && 'border-coral/40 bg-coral-soft',
      )}
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        {t(`help.categories.${h.category}` as 'help.categories.emergency')}
      </p>
      <h3 className="mt-1 font-semibold">{h.name}</h3>
      <p className="mt-2 flex-1 text-sm text-muted-foreground">
        {bn ? h.description_bn : h.description_en}
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        {t('help.hours')}: {h.hours}
        {h.is_toll_free === true && ` · ${t('help.tollFree')}`}
      </p>
      <a
        href={telHref(h.number)}
        className={cn(
          'mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-base font-semibold',
          emergency
            ? 'bg-coral text-coral-foreground hover:bg-coral/90'
            : 'bg-primary text-primary-foreground hover:bg-primary/90',
        )}
      >
        <Phone className="size-4" aria-hidden />
        {t('help.call', { number: h.number })}
      </a>
      <a
        href={h.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-center text-[11px] text-muted-foreground hover:underline"
      >
        {t('help.verified', { date: formatDate(h.verified_at) })}
      </a>
    </li>
  );
}

export function ResourcesPage() {
  const { t } = useTranslation();
  const bn = currentLanguage() === 'bn';
  const helplines = useHelplines();
  const orgs = useSupportOrganizations();
  const resources = useResources();

  return (
    <div>
      <PageHeader title={t('help.title')} subtitle={t('help.subtitle')} />

      <div
        role="note"
        className="mb-8 flex gap-3 rounded-2xl border border-coral/30 bg-coral-soft p-4"
      >
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
        <p className="text-sm">
          {t('help.emergencyNote')}{' '}
          <a href="tel:999" className="font-bold text-coral underline">
            999
          </a>
        </p>
      </div>

      <section aria-labelledby="helplines-title">
        <h2 id="helplines-title" className="mb-4 text-xl font-semibold">
          {t('help.helplines')}
        </h2>
        {helplines.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-56" />
            <Skeleton className="h-56" />
            <Skeleton className="hidden h-56 lg:block" />
          </div>
        ) : helplines.isError ? (
          <p className="text-destructive">{t('common.loadFailed')}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {helplines.data.map((h) => (
              <HelplineCard key={h.id} h={h} />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="orgs-title" className="mt-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 id="orgs-title" className="text-xl font-semibold">
            {t('help.organizations')}
          </h2>
          <Link
            to="/app/coaching"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <UserRoundSearch className="size-4" aria-hidden />
            {t('help.findProfessional')}
          </Link>
        </div>
        {orgs.isPending ? (
          <Skeleton className="h-48" />
        ) : orgs.isError ? (
          <p className="text-destructive">{t('common.loadFailed')}</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {orgs.data.map((o) => (
              <li key={o.id} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-soft">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <Building2 className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{bn && o.name_bn ? o.name_bn : o.name_en}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {bn && o.description_bn ? o.description_bn : o.description_en}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {o.website && (
                      <a
                        href={o.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {t('help.website')}
                        <ExternalLink className="size-3.5" aria-hidden />
                        <span className="sr-only">{t('common.opensNewTab')}</span>
                      </a>
                    )}
                    {o.phone && <span className="text-muted-foreground">{o.phone}</span>}
                  </div>
                  <a
                    href={o.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-[11px] text-muted-foreground hover:underline"
                  >
                    {t('help.verified', { date: formatDate(o.verified_at) })}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {resources.data && resources.data.length > 0 && (
        <section aria-labelledby="links-title" className="mt-12">
          <h2 id="links-title" className="mb-4 text-xl font-semibold">
            {t('help.readingList')}
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {resources.data.map((r) => (
              <li key={r.id}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-xl border bg-card p-4 hover:bg-muted"
                >
                  <span>
                    <span className="block font-medium">
                      {bn && r.title_bn ? r.title_bn : r.title_en}
                    </span>
                    <span className="text-xs text-muted-foreground">{r.source_org}</span>
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="mt-12 text-center text-xs text-muted-foreground">{t('help.disclaimer')}</p>
    </div>
  );
}

export default ResourcesPage;
