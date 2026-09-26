import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { Shapla } from '@/components/illustrations/Shapla';
import { Button } from '@/components/ui/button';

export function FinalCta() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="cta-title" className="pb-20 sm:pb-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand to-brand-strong px-6 py-14 text-center text-brand-foreground shadow-lifted sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgb(255_255_255/0.12)_1px,transparent_1px)] [background-size:22px_22px]"
            />
            <Shapla className="pointer-events-none absolute -bottom-6 -left-6 size-40 opacity-20 sm:size-56" />
            <Shapla className="pointer-events-none absolute -top-10 -right-8 size-32 rotate-12 opacity-15 sm:size-44" />

            <div className="relative">
              <h2
                id="cta-title"
                className="text-3xl font-bold tracking-tight text-balance sm:text-4xl"
              >
                {t('landing.cta.title')}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/85">{t('landing.cta.body')}</p>
              <Button
                asChild
                size="lg"
                className="mt-8 h-12 rounded-xl bg-white px-6 text-base text-brand shadow-lg hover:bg-white/90"
              >
                <Link to="/signup">
                  {t('landing.cta.button')}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
