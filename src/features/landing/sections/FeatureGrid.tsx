import type { ReactNode } from 'react';
import {
  Activity,
  BookLock,
  Briefcase,
  Gamepad2,
  MessagesSquare,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/Container';
import { Reveal } from '@/components/Reveal';
import { cn } from '@/lib/utils';
import { SectionHeading } from '../components/SectionHeading';

type FeatureKey = 'mood' | 'journal' | 'mentors' | 'community' | 'arcade' | 'toolkit';

interface Feature {
  key: FeatureKey;
  icon: LucideIcon;
  tint: string;
  wide?: boolean;
}

const FEATURES: readonly Feature[] = [
  { key: 'mood', icon: Activity, tint: 'bg-secondary text-primary', wide: true },
  { key: 'journal', icon: BookLock, tint: 'bg-coral-soft text-coral' },
  {
    key: 'mentors',
    icon: UserRoundCheck,
    tint: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  {
    key: 'community',
    icon: MessagesSquare,
    tint: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    wide: true,
  },
  {
    key: 'arcade',
    icon: Gamepad2,
    tint: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
  },
  { key: 'toolkit', icon: Briefcase, tint: 'bg-secondary text-primary', wide: true },
];

/** Illustrative bar heights for the mood card (1–5 scale). */
const MOOD_BARS = [3, 2, 4, 3, 4, 5, 4, 3, 5, 4, 5, 5] as const;

function MoodVisual() {
  return (
    <div aria-hidden className="flex h-24 items-end gap-1.5">
      {MOOD_BARS.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-md bg-primary/80"
          style={{ height: `${v * 20}%`, opacity: 0.35 + v * 0.13 }}
        />
      ))}
    </div>
  );
}

function CommunityVisual() {
  const { t } = useTranslation();
  return (
    <div aria-hidden className="space-y-2 text-sm">
      <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
        {t('landing.features.items.community.sample1')}
      </p>
      <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-foreground">
        {t('landing.features.items.community.sample2')}
      </p>
    </div>
  );
}

function ToolkitVisual() {
  const { t } = useTranslation();
  const careers = t('landing.features.items.toolkit.careers', { returnObjects: true });
  return (
    <ul aria-hidden className="flex flex-wrap gap-2">
      {careers.map((c) => (
        <li key={c} className="rounded-full border bg-background px-3 py-1 text-xs font-medium">
          {c}
        </li>
      ))}
    </ul>
  );
}

const VISUALS: Partial<Record<FeatureKey, () => ReactNode>> = {
  mood: MoodVisual,
  community: CommunityVisual,
  toolkit: ToolkitVisual,
};

export function FeatureGrid() {
  const { t } = useTranslation();

  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            id="features-title"
            eyebrow={t('landing.features.eyebrow')}
            title={t('landing.features.title')}
            subtitle={t('landing.features.subtitle')}
          />
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, icon: Icon, tint, wide }, i) => {
            const Visual = VISUALS[key];
            return (
              <li key={key} className={cn(wide && 'lg:col-span-2')}>
                <Reveal delay={(i % 3) * 0.08} className="h-full">
                  <article
                    className={cn(
                      'group flex h-full flex-col gap-6 rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted sm:p-7',
                      wide && Visual && 'lg:flex-row lg:items-center',
                    )}
                  >
                    <div className="flex-1">
                      <div
                        className={cn('flex size-11 items-center justify-center rounded-xl', tint)}
                      >
                        <Icon className="size-5" aria-hidden />
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">
                        {t(`landing.features.items.${key}.title`)}
                      </h3>
                      <p className="mt-2 text-pretty text-muted-foreground">
                        {t(`landing.features.items.${key}.body`)}
                      </p>
                    </div>
                    {Visual && (
                      <div className="lg:w-[45%]">
                        <Visual />
                      </div>
                    )}
                  </article>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
