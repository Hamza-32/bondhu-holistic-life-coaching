import { ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '../components/SectionHeading';
import { SOURCES } from '../sources';

/** Verified national statistics. Values come from the WHO release linked below (see docs/DATA_SOURCES.md). */
export function Stats() {
  const { t } = useTranslation();
  const items = t('landing.stats.items', { returnObjects: true });

  return (
    <section aria-labelledby="stats-title" className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            id="stats-title"
            eyebrow={t('landing.stats.eyebrow')}
            title={t('landing.stats.title')}
            subtitle={t('landing.stats.subtitle')}
          />
        </Reveal>

        <dl className="mt-14 grid gap-4 md:grid-cols-3">
          {items.map((item, i) => (
            <Reveal key={item.value} delay={i * 0.08}>
              <div className="flex h-full flex-col-reverse rounded-2xl border bg-card p-6 text-center shadow-soft sm:p-8">
                <dt className="mt-3 text-pretty text-muted-foreground">{item.label}</dt>
                <dd className="text-5xl font-extrabold tracking-tight text-primary">
                  {item.value}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-3xl text-center text-lg font-medium text-balance">
            {t('landing.stats.closing')}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-center text-xs text-pretty text-muted-foreground">
            {t('landing.stats.source')}{' '}
            <a
              href={SOURCES.nmhs2019}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
            >
              {t('landing.stats.sourceLink')}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
