import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRecordGame } from '../shared/api';
import { GameShell, Stat } from '../shared/GameShell';
import { getGame } from '../shared/games';
import { moveFocus } from '../shared/grid';
import { usePersonalBest } from '../shared/personalBest';
import { useSound } from '../shared/sound';
import { formatClock, useElapsed } from '../shared/useElapsed';
import { useKeydown } from '../shared/useKeydown';
import { deal, LEVELS, score, type Level, type MotifId } from './logic';
import { CardBack, Motif } from './Motif';

const GAME = getGame('rickshaw-memory');
/** How long a mismatched pair stays visible. */
const MISMATCH_MS = 900;

interface Result {
  moves: number;
  seconds: number;
  score: number;
  newBest: boolean;
}

function Board({
  level,
  paused,
  onWin,
}: {
  level: Level;
  paused: boolean;
  onWin: (moves: number, seconds: number) => void;
}) {
  const { t } = useTranslation();
  const { pairs, cols } = LEVELS[level];
  const [deck] = useState(() => deal(pairs));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<MotifId>>(() => new Set());
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [focus, setFocus] = useState(0);
  const won = matched.size === pairs;
  const elapsed = useElapsed(started && !paused && !won);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const play = useSound();
  const rows = deck.length / cols;

  const flip = (index: number) => {
    const card = deck[index];
    if (!card || paused || won || flipped.length === 2) return;
    if (flipped.includes(index) || matched.has(card.motif)) return;
    setStarted(true);
    play('flip');
    const [firstIndex] = flipped;
    const first = firstIndex === undefined ? undefined : deck[firstIndex];
    if (firstIndex === undefined || !first) {
      setFlipped([index]);
      return;
    }
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (first.motif === card.motif) {
      const next = new Set(matched).add(card.motif);
      setMatched(next);
      setFlipped([]);
      play('match');
      if (next.size === pairs) onWin(nextMoves, elapsed);
    } else {
      setFlipped([firstIndex, index]);
      setTimeout(() => setFlipped([]), MISMATCH_MS);
    }
  };

  return (
    <div className="rounded-3xl border bg-card p-3 shadow-soft sm:p-6">
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Stat label={t('games.rickshawMemory.moves')} value={formatNumber(moves)} />
        <Stat label={t('games.rickshawMemory.time')} value={formatClock(elapsed, formatNumber)} />
        <Stat
          label={t('games.rickshawMemory.pairs')}
          value={`${formatNumber(matched.size)} / ${formatNumber(pairs)}`}
        />
      </div>
      <div
        role="group"
        aria-label={t('games.rickshawMemory.board')}
        className={cn('mx-auto grid gap-2 sm:gap-3', cols === 6 ? 'max-w-2xl' : 'max-w-md')}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {deck.map((card, i) => {
          const faceUp = flipped.includes(i) || matched.has(card.motif);
          const n = formatNumber(i + 1);
          return (
            <button
              key={card.id}
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              tabIndex={i === focus ? 0 : -1}
              aria-label={
                faceUp
                  ? t('games.rickshawMemory.cardShown', {
                      n,
                      motif: t(`games.rickshawMemory.motifs.${card.motif}`),
                    })
                  : t('games.rickshawMemory.cardHidden', { n })
              }
              aria-disabled={matched.has(card.motif) || undefined}
              onClick={() => flip(i)}
              onFocus={() => setFocus(i)}
              onKeyDown={(e) => {
                const target = moveFocus(i, e.key, rows, cols);
                if (target === null) return;
                e.preventDefault();
                setFocus(target);
                buttons.current[target]?.focus();
              }}
              className="aspect-square touch-manipulation rounded-xl [perspective:600px] focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
            >
              <span
                className={cn(
                  'relative block size-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none',
                  faceUp && '[transform:rotateY(180deg)]',
                )}
              >
                <CardBack className="absolute inset-0 size-full rounded-xl shadow-sm [backface-visibility:hidden]" />
                <span
                  className={cn(
                    'absolute inset-0 flex [transform:rotateY(180deg)] items-center justify-center rounded-xl border-2 bg-amber-50 p-1.5 [backface-visibility:hidden] dark:bg-amber-100',
                    matched.has(card.motif) ? 'border-emerald-500' : 'border-amber-300',
                  )}
                >
                  <Motif motif={card.motif} className="size-full" />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RickshawMemory() {
  const { t } = useTranslation();
  const [level, setLevel] = useState<Level>('easy');
  const [round, setRound] = useState(0);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const { best, submit } = usePersonalBest(GAME.code);
  const record = useRecordGame();
  const play = useSound();

  const restart = (next: Level = level) => {
    setLevel(next);
    setResult(null);
    setPaused(false);
    setRound((r) => r + 1);
  };

  const onWin = (moves: number, seconds: number) => {
    const points = score(level, moves, seconds);
    const newBest = submit(points);
    play('win');
    setResult({ moves, seconds, score: points, newBest });
    record.mutate({ game_code: GAME.code, score: points, duration_seconds: seconds });
  };

  useKeydown((e) => {
    if ((e.key === 'p' || e.key === 'Escape') && !result) {
      e.preventDefault();
      setPaused((p) => !p);
    }
  });

  return (
    <GameShell
      game={GAME}
      personalBest={best}
      paused={paused}
      onTogglePause={result ? undefined : () => setPaused((p) => !p)}
      onRestart={() => restart()}
      toolbar={
        <div
          role="radiogroup"
          aria-label={t('games.rickshawMemory.difficulty')}
          className="inline-flex rounded-lg border p-0.5"
        >
          {(Object.keys(LEVELS) as Level[]).map((l) => (
            <button
              key={l}
              type="button"
              role="radio"
              aria-checked={level === l}
              onClick={() => restart(l)}
              className={cn(
                'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                level === l ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
              )}
            >
              {t(`games.rickshawMemory.levels.${l}`)}
            </button>
          ))}
        </div>
      }
    >
      {result && (
        <div role="status" className="mb-4 rounded-2xl bg-secondary p-5 text-center">
          <p className="text-lg font-semibold">{t('games.rickshawMemory.winTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('games.rickshawMemory.winBody', {
              moves: formatNumber(result.moves),
              time: formatClock(result.seconds, formatNumber),
              score: formatNumber(result.score),
            })}
          </p>
          {result.newBest && (
            <p className="mt-1 text-sm font-semibold text-primary">
              {t('games.rickshawMemory.newBest')}
            </p>
          )}
          <Button className="mt-4" onClick={() => restart()}>
            {t('games.rickshawMemory.again')}
          </Button>
        </div>
      )}
      <Board key={`${level}-${round}`} level={level} paused={paused} onWin={onWin} />
      {paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-card/90 backdrop-blur-sm">
          <p className="text-2xl font-bold">{t('arcade.paused')}</p>
          <Button onClick={() => setPaused(false)}>{t('arcade.resume')}</Button>
        </div>
      )}
    </GameShell>
  );
}

export default RickshawMemory;
