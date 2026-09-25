import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle, Heart, Quote, Users, Wind } from 'lucide-react';

const REMINDER_INTERVAL_MS = 8000;

export const Home = () => {
  const { t } = useTranslation();
  // Original, unattributed reminders (the old famous-person quotes had disputed attributions).
  const reminders = t('landing.reminders', { returnObjects: true });
  const [reminderIndex, setReminderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setReminderIndex((i) => (i + 1) % reminders.length);
    }, REMINDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [reminders.length]);

  const features = [
    { key: 'mentors', icon: Users, tint: 'bg-secondary text-primary' },
    {
      key: 'wellness',
      icon: Heart,
      tint: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    },
    { key: 'habits', icon: CheckCircle, tint: 'bg-coral-soft text-coral' },
  ] as const;

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative flex flex-col items-center gap-10 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-card to-secondary p-6 shadow-lifted sm:p-8 md:flex-row md:p-16">
        <div className="relative z-10 flex-1 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm">
              <span className="size-2 rounded-full bg-coral" aria-hidden />
              {t('landing.eyebrow')}
            </p>
            <h1 className="text-4xl leading-tight font-extrabold text-foreground md:text-6xl">
              {t('landing.titleLine1')} <br />
              <span className="bg-linear-to-r from-primary to-coral bg-clip-text text-transparent">
                {t('landing.titleLine2')}
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {t('landing.body')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/app"
              className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl active:scale-95"
            >
              {t('landing.ctaPrimary')} <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              to="/app/community"
              className="rounded-xl border-2 border-border bg-card px-8 py-4 font-bold text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              {t('landing.ctaSecondary')}
            </Link>
          </motion.div>
        </div>

        <div className="relative flex w-full flex-1 justify-center">
          <div
            className="absolute top-1/2 left-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-tr from-primary/10 to-coral/10 blur-3xl"
            aria-hidden
          />
          {/* TODO(phase-6): replace this hot-linked photo with an original SVG illustration. */}
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            alt={t('landing.heroImageAlt')}
            width={448}
            height={448}
            loading="eager"
            className="relative z-10 aspect-square w-full max-w-md rotate-2 rounded-2xl object-cover shadow-2xl transition-transform duration-700 hover:rotate-0"
          />
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-6 left-0 z-20 flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-lg sm:-left-4"
          >
            <div className="rounded-full bg-secondary p-2 text-primary">
              <Wind className="size-6" aria-hidden />
            </div>
            <div>
              <p className="font-bold text-foreground">{t('landing.badgeTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('landing.badgeBody')}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value props */}
      <section className="grid gap-8 md:grid-cols-3">
        {features.map(({ key, icon: Icon, tint }) => (
          <div
            key={key}
            className="group rounded-2xl border border-border bg-card p-8 text-center shadow-soft transition-all duration-300 hover:border-primary/30"
          >
            <div
              className={`mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${tint}`}
            >
              <Icon className="size-8" aria-hidden />
            </div>
            <h2 className="mb-3 text-xl font-bold text-foreground">
              {t(`landing.features.${key}.title`)}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {t(`landing.features.${key}.body`)}
            </p>
          </div>
        ))}
      </section>

      {/* Daily reminder */}
      <section
        aria-label={t('landing.reminderLabel')}
        className="relative overflow-hidden rounded-2xl bg-brand p-8 text-center text-brand-foreground sm:p-12"
      >
        <div className="relative z-10 mx-auto max-w-2xl">
          <Quote className="mx-auto mb-6 size-12 opacity-60" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.p
              key={reminderIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="mb-6 text-2xl leading-relaxed font-semibold md:text-3xl"
              aria-live="polite"
            >
              {reminders[reminderIndex]}
            </motion.p>
          </AnimatePresence>
          <div className="mx-auto mb-4 h-1 w-16 rounded-full bg-white/60" aria-hidden />
          <p className="text-sm font-medium tracking-wide text-white/80 uppercase">
            {t('landing.reminderLabel')}
          </p>
        </div>
      </section>
    </div>
  );
};
