import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { SectionHeading } from '../components/SectionHeading';

const STEPS = ['one', 'two', 'three'] as const;

export function HowItWorks() {
  const { t, i18n } = useTranslation();
  const formatNumber = new Intl.NumberFormat(i18n.resolvedLanguage === 'bn' ? 'bn-BD' : 'en');

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="scroll-mt-20 border-y bg-muted/40 py-20 sm:py-28"
    >
      <Container>
        <Reveal>
          <SectionHeading
            id="how-title"
            eyebrow={t('landing.how.eyebrow')}
            title={t('landing.how.title')}
          />
        </Reveal>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {/* Connector line between the step numbers (desktop) */}
          <div
            aria-hidden
            className="absolute top-6 right-[16.66%] left-[16.66%] hidden border-t-2 border-dashed border-primary/30 md:block"
          />
          {STEPS.map((step, i) => (
            <li key={step} className="relative text-center">
              <Reveal delay={i * 0.1}>
                <div className="relative mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg ring-8 shadow-primary/25 ring-background">
                  {formatNumber.format(i + 1)}
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  {t(`landing.how.steps.${step}.title`)}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-pretty text-muted-foreground">
                  {t(`landing.how.steps.${step}.body`)}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
