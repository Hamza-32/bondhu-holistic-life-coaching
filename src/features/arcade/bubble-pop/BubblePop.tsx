import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/useUiStore';
import { useRecordGame } from '../shared/api';
import { GameShell, Stat } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { moveFocus } from './grid';

const GAME = getGame('bubble-pop');
const ROWS = 6;
const COLS = 8;
const SIZE = ROWS * COLS;
const TOTAL_KEY = 'bondhu-bubble-total';

function readTotal() {
  try {
    return Number(localStorage.getItem(TOTAL_KEY)) || 0;
  } catch {
    return 0;
  }
}

function Sheet({
  onPop,
  onComplete,
}: {
  onPop: () => void;
  onComplete: (seconds: number) => void;
}) {
  const { t } = useTranslation();
  const [popped, setPopped] = useState<ReadonlySet<number>>(() => new Set());
  const [focus, setFocus] = useState(0);
  const startedAt = useRef<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const play = useSound();
  const hapticsEnabled = useUiStore((s) => s.hapticsEnabled);

  const pop = (index: number, timeStamp: number) => {
    if (popped.has(index)) return;
    startedAt.current ??= timeStamp;
    const next = new Set(popped).add(index);
    setPopped(next);
    play('pop');
    if (hapticsEnabled && 'vibrate' in navigator) navigator.vibrate(8);
    onPop();
    if (next.size === SIZE) onComplete(Math.round((timeStamp - startedAt.current) / 1000));
  };

  const done = popped.size === SIZE;

  return (
    <div className="rounded-3xl border bg-card p-4 shadow-soft sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2 text-sm" aria-live="polite">
        <Stat
          label={t('games.bubblePop.popped')}
          value={`${formatNumber(popped.size)} / ${formatNumber(SIZE)}`}
        />
      </div>
      <div
        role="group"
        aria-label={t('games.bubblePop.grid')}
        className="mx-auto grid w-fit gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: SIZE }, (_, i) => {
          const isPopped = popped.has(i);
          const row = Math.floor(i / COLS) + 1;
          const col = (i % COLS) + 1;
          const label = { row: formatNumber(row), col: formatNumber(col) };
          return (
            <button
              key={i}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              tabIndex={i === focus ? 0 : -1}
              aria-pressed={isPopped}
              aria-label={
                isPopped
                  ? t('games.bubblePop.poppedBubble', label)
                  : t('games.bubblePop.bubble', label)
              }
              onPointerDown={(e) => {
                // Pop on press (not release) so it feels like real bubble wrap.
                if (e.button === 0) pop(i, e.timeStamp);
              }}
              onClick={(e) => {
                // Keyboard activation (Enter/Space) arrives as a click with detail 0.
                if (e.detail === 0) pop(i, e.timeStamp);
              }}
              onFocus={() => setFocus(i)}
              onKeyDown={(e) => {
                const target = moveFocus(i, e.key, ROWS, COLS);
                if (target === null) return;
                e.preventDefault();
                setFocus(target);
                buttons.current[target]?.focus();
              }}
              className={cn(
                'size-9 touch-manipulation rounded-full border select-none sm:size-12',
                'focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none',
                isPopped
                  ? 'border-dashed border-muted-foreground/30 bg-muted'
                  : 'border-sky-300/70 bg-[radial-gradient(circle_at_35%_30%,white_0%,var(--color-sky-100)_35%,var(--color-sky-300)_100%)] shadow-[inset_-2px_-3px_6px_rgb(0_0_0/0.08)] motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:active:scale-90 dark:border-sky-700 dark:bg-[radial-gradient(circle_at_35%_30%,var(--color-sky-200)_0%,var(--color-sky-600)_45%,var(--color-sky-900)_100%)]',
              )}
            >
              {isPopped && (
                <svg viewBox="0 0 24 24" className="size-full text-muted-foreground/40" aria-hidden>
                  <path
                    d="M7 9l3 2-2 3 4-1 1 4 2-4 3 1-2-3 2-2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
      {done && (
        <p role="status" className="mt-5 text-center font-semibold">
          {t('games.bubblePop.sheetDone')}
        </p>
      )}
    </div>
  );
}

export function BubblePop() {
  const { t } = useTranslation();
  const [sheet, setSheet] = useState(0);
  const [total, setTotal] = useState(readTotal);
  const { best, increment } = usePersonalBest(GAME.code);
  const record = useRecordGame();
  const play = useSound();

  const onPop = () =>
    setTotal((n) => {
      const next = n + 1;
      try {
        localStorage.setItem(TOTAL_KEY, String(next));
      } catch {
        // Not critical: the counter is just for fun.
      }
      return next;
    });

  const onComplete = (seconds: number) => {
    play('win');
    increment();
    record.mutate({ game_code: GAME.code, score: SIZE, duration_seconds: seconds });
    setTimeout(() => setSheet((s) => s + 1), 1500);
  };

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      onRestart={() => setSheet((s) => s + 1)}
      stats={<Stat label={t('games.bubblePop.allTime')} value={formatNumber(total)} />}
    >
      <Sheet key={sheet} onPop={onPop} onComplete={onComplete} />
    </GameShell>
  );
}

export default BubblePop;
