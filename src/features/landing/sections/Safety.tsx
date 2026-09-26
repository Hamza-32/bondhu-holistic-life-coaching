import {
  EyeOff,
  LockKeyhole,
  Phone,
  ShieldCheck,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { Button } from '@/components/ui/button';
import { SectionHeading } from '../components/SectionHeading';

const POINTS: readonly {
  key: 'private' | 'anonymous' | 'control' | 'notMedical';
  icon: LucideIcon;
}[] = [
  { key: 'private', icon: LockKeyhole },
  { key: 'anonymous', icon: EyeOff },
  { key: 'control', icon: ShieldCheck },
  { key: 'notMedical', icon: Stethoscope },
];

export function Safety() {
  const { t } = useTranslation();

  return (
    <section
      id="safety"
      aria-labelledby="safety-title"
      className="scroll-mt-20 border-y bg-muted/40 py-20 sm:py-28"
    >
      <Container className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <div>
          <Reveal>
            <SectionHeading
              id="safety-title"
              align="left"
              eyebrow={t('landing.safety.eyebrow')}
              title={t('landing.safety.title')}
              subtitle={t('landing.safety.body')}
            />
          </Reveal>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {POINTS.map(({ key, icon: Icon }, i) => (
              <li key={key}>
                <Reveal delay={i * 0.06} className="flex gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t(`landing.safety.points.${key}.title`)}</h3>
                    <p className="mt-1 text-sm text-pretty text-muted-foreground">
                      {t(`landing.safety.points.${key}.body`)}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1}>
          <aside
            aria-labelledby="help-title"
            className="rounded-3xl border border-coral/25 bg-card p-6 shadow-lifted sm:p-8"
          >
            <div className="flex size-12 items-center justify-center rounded-2xl bg-coral-soft text-coral">
              <Phone className="size-6" aria-hidden />
            </div>
            <h3 id="help-title" className="mt-5 text-2xl font-bold">
              {t('landing.safety.help.title')}
            </h3>
            <p className="mt-3 text-pretty text-muted-foreground">
              {t('landing.safety.help.body')}
            </p>

            <div className="mt-6 rounded-2xl bg-coral-soft p-5">
              <p className="text-4xl font-extrabold tracking-tight text-coral">
                {t('landing.safety.help.number')}
              </p>
              <p className="mt-1 text-sm font-medium">{t('landing.safety.help.service')}</p>
            </div>

            <Button
              asChild
              size="lg"
              className="mt-6 h-12 w-full rounded-xl bg-coral text-base text-coral-foreground hover:bg-coral/90"
            >
              <a href="tel:999">
                <Phone aria-hidden />
                {t('landing.safety.help.cta')}
              </a>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">{t('landing.safety.help.more')}</p>
          </aside>
        </Reveal>
      </Container>
    </section>
  );
}
