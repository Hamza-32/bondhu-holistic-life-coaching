import { useEffect, useRef, useState } from 'react';
import { useAnimate, type AnimationPlaybackControls } from 'motion/react';
import { Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/useUiStore';
import { useRecordGame } from '../shared/api';
import { GameShell, Stat } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { useKeydown } from '../shared/useKeydown';
import { formatClock, useElapsed } from '../shared/useElapsed';
import { PATTERNS, phaseAt, type PatternId, type PhaseKind } from './patterns';
import { ShaplaFlower } from './ShaplaFlower';

const GAME = getGame('shapla-breath');
const DURATIONS = [1, 3, 5] as const;
/** Sessions shorter than this are not recorded (and don't complete the breathing quest). */
const MIN_RECORD_SECONDS = 60;

const TARGET: Record<PhaseKind, { scale: number; opacity: number } | null> = {
  inhale: { scale: 1, opacity: 1 },
  hold: null,
  exhale: { scale: 0.58, opacity: 0.7 },
  rest: null,
};

function canVibrate() {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

function Session({
  pattern,
  minutes,
  onDone,
}: {
  pattern: PatternId;
  minutes: number;
  onDone: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const [paused, setPaused] = useState(false);
  const elapsed = useElapsed(!paused);
  const total = minutes * 60;
  const { index, phase, remaining, cycle } = phaseAt(PATTERNS[pattern], elapsed);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const play = useSound();
  const hapticsEnabled = useUiStore((s) => s.hapticsEnabled);
  const finished = useRef(false);

  const end = (seconds: number) => {
    // Guard: StrictMode double effects or a double click must not record twice.
    if (finished.current) return;
    finished.current = true;
    onDone(seconds);
  };

  // Each new phase: animate the flower and give an optional sound/vibration cue.
  useEffect(() => {
    const target = TARGET[phase.kind];
    if (target) {
      controls.current?.stop();
      controls.current = animate(scope.current, target, {
        duration: phase.seconds,
        ease: 'easeInOut',
      });
    }
    play(phase.kind === 'inhale' ? 'inhale' : phase.kind === 'exhale' ? 'exhale' : 'hold');
    if (hapticsEnabled && canVibrate()) navigator.vibrate(phase.kind === 'inhale' ? 60 : 30);
    // Re-run only when the phase changes (index + cycle), not every second.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, cycle]);

  useEffect(() => {
    if (paused) controls.current?.pause();
    else controls.current?.play();
  }, [paused]);

  useKeydown((e) => {
    if (e.key === ' ' || e.key === 'p' || e.key === 'Escape') {
      e.preventDefault();
      setPaused((p) => !p);
    }
  });

  useEffect(() => {
    if (elapsed >= total) end(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, total]);

  return (
    <div className="flex flex-col items-center rounded-3xl border bg-card p-6 shadow-soft sm:p-10">
      <div className="mb-6 flex flex-wrap justify-center gap-2 text-sm">
        <Stat
          label={t('games.shaplaBreath.remaining')}
          value={formatClock(Math.max(0, total - elapsed), formatNumber)}
        />
        <Stat label={t('games.shaplaBreath.cycles')} value={formatNumber(cycle)} />
      </div>
      <div
        ref={scope}
        className="size-64 sm:size-80"
        style={{ transform: 'scale(0.58)', opacity: 0.7 }}
      >
        <ShaplaFlower className="size-full" />
      </div>
      <p className="mt-6 text-3xl font-bold" aria-live="polite">
        {paused ? t('arcade.paused') : t(`games.shaplaBreath.phases.${phase.kind}`)}
      </p>
      <p className="mt-1 text-xl text-muted-foreground tabular-nums" aria-hidden>
        {formatNumber(remaining)}
      </p>
      <div className="mt-8 flex gap-2">
        <Button variant="outline" onClick={() => setPaused((p) => !p)} aria-pressed={paused}>
          {paused ? t('arcade.resume') : t('arcade.pause')}
        </Button>
        <Button variant="ghost" onClick={() => end(elapsed)}>
          {t('games.shaplaBreath.finish')}
        </Button>
      </div>
    </div>
  );
}

export function ShaplaBreath() {
  const { t } = useTranslation();
  const [pattern, setPattern] = useState<PatternId>('box');
  const [minutes, setMinutes] = useState<number>(1);
  const [status, setStatus] = useState<'setup' | 'running' | 'done'>('setup');
  const [lastSeconds, setLastSeconds] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const record = useRecordGame();
  const { best, increment } = usePersonalBest(GAME.code);
  const hapticsEnabled = useUiStore((s) => s.hapticsEnabled);
  const setHapticsEnabled = useUiStore((s) => s.setHapticsEnabled);
  const play = useSound();

  const finish = (seconds: number) => {
    setLastSeconds(seconds);
    setStatus('done');
    if (seconds >= MIN_RECORD_SECONDS) {
      play('win');
      increment();
      record.mutate({ game_code: GAME.code, score: seconds, duration_seconds: seconds });
    }
  };

  const choice = (active: boolean) =>
    cn(
      'rounded-xl border px-4 py-3 text-left transition-colors',
      active ? 'border-primary bg-secondary' : 'hover:bg-muted',
    );

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      toolbar={
        canVibrate() ? (
          <Button
            variant="outline"
            size="sm"
            aria-pressed={hapticsEnabled}
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
          >
            <Smartphone aria-hidden />
            {hapticsEnabled
              ? t('games.shaplaBreath.vibrationOn')
              : t('games.shaplaBreath.vibrationOff')}
          </Button>
        ) : undefined
      }
    >
      {status === 'running' ? (
        <Session key={runKey} pattern={pattern} minutes={minutes} onDone={finish} />
      ) : (
        <div className="rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          {status === 'done' && (
            <div role="status" className="mb-8 rounded-2xl bg-secondary p-5 text-center">
              <p className="text-lg font-semibold">
                {lastSeconds >= MIN_RECORD_SECONDS
                  ? t('games.shaplaBreath.doneTitle')
                  : t('games.shaplaBreath.shortTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('games.shaplaBreath.doneBody', { time: formatClock(lastSeconds, formatNumber) })}
              </p>
            </div>
          )}
          <div className="mx-auto mb-6 size-32">
            <ShaplaFlower className="size-full" />
          </div>
          <fieldset>
            <legend className="font-semibold">{t('games.shaplaBreath.patternLabel')}</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(Object.keys(PATTERNS) as PatternId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={pattern === id}
                  onClick={() => setPattern(id)}
                  className={choice(pattern === id)}
                >
                  <span className="block font-semibold">
                    {t(`games.shaplaBreath.patterns.${id}.name`)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {t(`games.shaplaBreath.patterns.${id}.desc`)}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-6">
            <legend className="font-semibold">{t('games.shaplaBreath.durationLabel')}</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={minutes === m}
                  onClick={() => setMinutes(m)}
                  className={choice(minutes === m)}
                >
                  {t('games.shaplaBreath.minutes', { count: m, formatted: formatNumber(m) })}
                </button>
              ))}
            </div>
          </fieldset>
          <Button
            size="lg"
            className="mt-8 h-12 w-full sm:w-auto"
            onClick={() => {
              setRunKey((k) => k + 1);
              setStatus('running');
            }}
          >
            {status === 'done' ? t('games.shaplaBreath.again') : t('games.shaplaBreath.start')}
          </Button>
        </div>
      )}
    </GameShell>
  );
}

export default ShaplaBreath;
