import type { ReactNode } from 'react';
import { ArrowLeft, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { useUiStore } from '@/stores/useUiStore';
import type { GameInfo } from './games';
import { Leaderboard } from './Leaderboard';

interface GameShellProps {
  game: GameInfo;
  children: ReactNode;
  /** Pause/resume control; omit for games that have no running clock. */
  paused?: boolean;
  onTogglePause?: () => void;
  onRestart?: () => void;
  /** Extra controls (difficulty, mode…) shown in the toolbar. */
  toolbar?: ReactNode;
  /** Live stats shown above the play area (moves, time, score…). */
  stats?: ReactNode;
  personalBest?: number | null;
}

/** Common frame for every arcade game: navigation, controls, sound, best score, leaderboard. */
export function GameShell({
  game,
  children,
  paused,
  onTogglePause,
  onRestart,
  toolbar,
  stats,
  personalBest,
}: GameShellProps) {
  const { t } = useTranslation();
  const soundEnabled = useUiStore((s) => s.soundEnabled);
  const setSoundEnabled = useUiStore((s) => s.setSoundEnabled);
  const unit = t(`games.${game.key}.unit`);

  return (
    <div>
      <Link
        to="/app/arcade"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {t('arcade.backToArcade')}
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t(`games.${game.key}.title`)}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{t(`games.${game.key}.howTo`)}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div
            className="mb-4 flex flex-wrap items-center gap-2"
            role="toolbar"
            aria-label={t('arcade.controls')}
          >
            {onTogglePause && (
              <Button variant="outline" size="sm" onClick={onTogglePause} aria-pressed={paused}>
                {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
                {paused ? t('arcade.resume') : t('arcade.pause')}
              </Button>
            )}
            {onRestart && (
              <Button variant="outline" size="sm" onClick={onRestart}>
                <RotateCcw aria-hidden />
                {t('arcade.restart')}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}
              {soundEnabled ? t('arcade.soundOn') : t('arcade.soundOff')}
            </Button>
            {toolbar}
          </div>
          {stats && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm" aria-live="polite">
              {stats}
            </div>
          )}
          <div className="relative">{children}</div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              {t(`games.${game.key}.bestLabel`)}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {personalBest === null || personalBest === undefined
                ? '–'
                : formatNumber(personalBest)}{' '}
              <span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{t('arcade.personalBestNote')}</p>
          </div>
          <Leaderboard game={game.code} mode={game.leaderboard} unit={unit} />
        </aside>
      </div>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </span>
  );
}
