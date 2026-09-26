import { Annoyed, CalendarClock, Flame, Frown, Laugh, Meh, PenLine, Smile } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Shapla } from '@/components/illustrations/Shapla';
import { cn } from '@/lib/utils';

const MOOD_ICONS = [Frown, Annoyed, Meh, Smile, Laugh] as const;
const SELECTED_MOOD = 3;
/** Sample week (Sat → Fri) on a 1–5 scale. Illustrative only. */
const WEEK = [3, 2, 3, 4, 3, 4, 5] as const;

const CHART_W = 280;
const CHART_H = 96;
const PAD = 8;

function chartPoints() {
  const step = (CHART_W - PAD * 2) / (WEEK.length - 1);
  return WEEK.map((v, i) => ({
    x: PAD + i * step,
    y: PAD + ((5 - v) / 4) * (CHART_H - PAD * 2),
  }));
}

function MoodChart() {
  const points = chartPoints();
  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L${last?.x ?? 0},${CHART_H} L${first?.x ?? 0},${CHART_H} Z`;

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="h-24 w-full text-primary" aria-hidden>
      <defs>
        <linearGradient id="hero-mood-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.25" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hero-mood-fill)" />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last && (
        <circle
          cx={last.x}
          cy={last.y}
          r="5"
          className="fill-card"
          stroke="currentColor"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

/** Original, code-drawn product preview for the hero (no screenshots or stock photos). */
export function HeroMockup() {
  const { t } = useTranslation();
  const moods = t('landing.mockup.moods', { returnObjects: true });
  const days = t('landing.mockup.days', { returnObjects: true });

  return (
    <div
      role="img"
      aria-label={t('landing.mockup.ariaLabel')}
      className="relative mx-auto w-full max-w-md lg:max-w-lg"
    >
      <div aria-hidden className="relative">
        {/* Main card */}
        <div className="relative z-10 rounded-3xl border bg-card p-5 shadow-lifted sm:p-6">
          {/* Left-aligned so the floating breathing card (top-right) never covers the streak chip */}
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold text-muted-foreground">
              {t('landing.mockup.today')}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1 text-xs font-semibold text-coral">
              <Flame className="size-3.5" />
              {t('landing.mockup.streak')}
            </span>
          </div>

          <p className="mt-4 text-lg font-bold">{t('landing.mockup.moodQuestion')}</p>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {MOOD_ICONS.map((Icon, i) => (
              <div
                key={i}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl border px-1 py-2.5 text-[11px] font-medium',
                  i === SELECTED_MOOD
                    ? 'border-primary bg-secondary text-primary'
                    : 'border-transparent bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-5" />
                <span className="w-full truncate text-center">{moods[i]}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-muted/60 p-4">
            <p className="text-xs font-semibold text-muted-foreground">
              {t('landing.mockup.weekLabel')}
            </p>
            <MoodChart />
            <div className="mt-1 grid grid-cols-7 text-center text-[10px] text-muted-foreground">
              {days.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <CalendarClock className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{t('landing.mockup.sessionLabel')}</p>
              <p className="truncate text-sm font-semibold">{t('landing.mockup.session')}</p>
            </div>
          </div>
        </div>

        {/* Floating: breathing exercise */}
        <div className="absolute -top-12 -right-6 z-20 hidden w-40 rounded-2xl border bg-card p-4 text-center shadow-lifted motion-safe:animate-float-up sm:block lg:-right-10">
          <div className="motion-safe:animate-breathe">
            <Shapla className="mx-auto size-16" />
          </div>
          <p className="mt-1 text-sm font-bold">{t('landing.mockup.breathe')}</p>
          <p className="text-[11px] text-muted-foreground">{t('landing.mockup.breatheSub')}</p>
        </div>

        {/* Floating: journal prompt */}
        <div className="absolute -bottom-20 -left-8 z-20 hidden w-60 rounded-2xl border bg-card p-4 shadow-lifted motion-safe:animate-float-down sm:block lg:-left-14">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <PenLine className="size-3.5" />
            {t('landing.mockup.promptLabel')}
          </p>
          <p className="mt-1.5 text-sm leading-snug font-medium">{t('landing.mockup.prompt')}</p>
        </div>
      </div>
    </div>
  );
}
