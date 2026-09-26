import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Button } from '@/components/ui/button';
import { HeroMockup } from '../components/HeroMockup';
import { TryDemoButton } from '@/features/demo/TryDemoButton';

export function Hero() {
  const { t } = useTranslation();
  const trust = t('landing.hero.trust', { returnObjects: true });

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Decorative background: soft colour fields + a fading dot grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-20 -right-40 size-[30rem] rounded-full bg-coral/10 blur-3xl" />
        <div className="absolute inset-0 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [mask-image:linear-gradient(to_bottom,black,transparent_85%)] [background-size:24px_24px]" />
      </div>

      <Container className="grid items-center gap-16 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pt-28 lg:pb-36">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden />
            {t('landing.hero.badge')}
          </p>

          <h1
            id="hero-title"
            className="mt-6 text-4xl leading-[1.1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            {t('landing.hero.title')}{' '}
            <span className="relative inline-block text-primary">
              {t('landing.hero.titleHighlight')}
              {/* Hand-drawn coral underline */}
              <svg
                aria-hidden
                viewBox="0 0 300 16"
                preserveAspectRatio="none"
                className="absolute -bottom-2 left-0 h-3 w-full text-coral sm:-bottom-3 sm:h-4"
              >
                <path
                  d="M4 11c48-6 98-9 148-8s96 3 144 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
            {t('landing.hero.body')}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl px-6 text-base shadow-lg shadow-primary/20"
            >
              <Link to="/signup">
                {t('landing.hero.ctaPrimary')}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            <TryDemoButton className="h-12 rounded-xl px-6 text-base" />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {trust.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="size-4 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="px-2 sm:px-10 lg:px-6"
        >
          <HeroMockup />
        </motion.div>
      </Container>
    </section>
  );
}
