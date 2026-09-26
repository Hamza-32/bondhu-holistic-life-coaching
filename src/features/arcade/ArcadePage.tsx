import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRecordGame, type GameCode } from './api';

type Tab = 'breathe' | 'pop' | 'memory';

/** Keeps the latest callback without restarting effects that depend on it. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
}

// Interim arcade (full rebuild in Phase 5). Finished sessions are stored as game_scores; the
// database awards XP with a daily cap, so none of these games can farm XP.
export function ArcadePage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('breathe');
  const record = useRecordGame();
  const save = (game_code: GameCode, score: number, duration_seconds: number) =>
    record.mutate({ game_code, score, duration_seconds });

  const tabs: { id: Tab; label: string }[] = [
    { id: 'breathe', label: t('arcade.tabs.breathe') },
    { id: 'pop', label: t('arcade.tabs.pop') },
    { id: 'memory', label: t('arcade.tabs.memory') },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('pages.arcade.title')} subtitle={t('pages.arcade.subtitle')} />
      <div role="group" aria-label={t('arcade.choose')} className="mb-8 flex flex-wrap gap-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            aria-pressed={activeTab === tab.id}
            className={cn(
              'rounded-full px-5 py-2 font-medium transition-all',
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg'
                : 'border bg-card text-muted-foreground hover:bg-muted',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border bg-card p-4 text-center shadow-soft sm:p-8 md:p-12">
        {activeTab === 'breathe' && (
          <BreathingGame onComplete={(secs) => save('shapla_breath', secs, secs)} />
        )}
        {activeTab === 'pop' && (
          <StressPopper onRound={(pops, secs) => save('bubble_pop', pops, secs)} />
        )}
        {activeTab === 'memory' && (
          <MemoryMatchGame
            onComplete={(secs) => save('rickshaw_memory', Math.max(10, 300 - secs), secs)}
          />
        )}
      </div>
    </div>
  );
}

/** A session counts after one full minute of guided breathing. */
const BREATHING_SESSION_SECONDS = 60;

const BreathingGame = ({ onComplete }: { onComplete: (seconds: number) => void }) => {
  const { t } = useTranslation();
  const [inhale, setInhale] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const completeRef = useLatest(onComplete);

  useEffect(() => {
    const phase = setInterval(() => setInhale((v) => !v), 4000);
    const clock = setInterval(() => setElapsed((s) => s + 1), 1000);
    const done = setTimeout(
      () => completeRef.current(BREATHING_SESSION_SECONDS),
      BREATHING_SESSION_SECONDS * 1000,
    );
    return () => {
      clearInterval(phase);
      clearInterval(clock);
      clearTimeout(done);
    };
  }, [completeRef]);

  const text = inhale ? t('arcade.inhale') : t('arcade.exhale');
  const remaining = Math.max(0, BREATHING_SESSION_SECONDS - elapsed);
  return (
    <div className="relative z-10 flex flex-col items-center">
      <motion.div
        animate={{
          scale: [1, 1.8, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 8,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="absolute h-48 w-48 rounded-full bg-blue-400 blur-xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 8,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="z-10 flex h-48 w-48 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-2xl font-bold text-white shadow-2xl"
      >
        {text}
      </motion.div>
      <p className="mt-8 text-muted-foreground" aria-live="polite">
        {remaining > 0
          ? t('arcade.breatheRemaining', { seconds: formatNumber(remaining) })
          : t('arcade.breatheDone')}
      </p>
    </div>
  );
};

const BUBBLE_COUNT = 16;
const BUBBLE_RESET_MS = 2000;

/** Every this many pops counts as one finished round (recorded once). */
const POPS_PER_ROUND = 50;

const StressPopper = ({ onRound }: { onRound: (pops: number, seconds: number) => void }) => {
  const { t } = useTranslation();
  const [bubbles, setBubbles] = useState<boolean[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, () => false),
  );
  const [pops, setPops] = useState(0);
  const roundStart = useRef<number | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const onPop = (at: number) => {
    roundStart.current ??= at;
    const next = pops + 1;
    setPops(next);
    if (next % POPS_PER_ROUND === 0) {
      onRound(POPS_PER_ROUND, (at - roundStart.current) / 1000);
      roundStart.current = at;
    }
  };

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const popBubble = (index: number, at: number) => {
    if (bubbles[index]) return;
    setBubbles((prev) => prev.map((popped, i) => (i === index ? true : popped)));
    onPop(at);

    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setBubbles((prev) => prev.map((popped, i) => (i === index ? false : popped)));
    }, BUBBLE_RESET_MS);
    timers.current.add(timer);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {t('arcade.pops', { count: pops, formatted: formatNumber(pops) })}
      </p>
      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {bubbles.map((popped, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => popBubble(i, e.timeStamp)}
            aria-label={
              popped ? t('arcade.bubblePopped', { n: i + 1 }) : t('arcade.popBubble', { n: i + 1 })
            }
            className={`size-14 transform rounded-full shadow-inner transition-all duration-200 active:scale-90 sm:size-16 ${
              popped ? 'scale-95 bg-secondary shadow-none' : 'bg-coral/80 shadow-lg hover:bg-coral'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Memory Match Game
const emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊'];
const cardItems = [...emojis, ...emojis];

interface MemoryCard {
  id: number;
  content: string;
  isFlipped: boolean;
  isMatched: boolean;
}

/** Unbiased Fisher–Yates shuffle (the old `sort(() => Math.random() - 0.5)` is biased). */
function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = result[i];
    const b = result[j];
    if (a === undefined || b === undefined) continue;
    result[i] = b;
    result[j] = a;
  }
  return result;
}

function newDeck(): MemoryCard[] {
  return shuffle(cardItems).map((content, id) => ({
    id,
    content,
    isFlipped: false,
    isMatched: false,
  }));
}

const MISMATCH_DELAY_MS = 1000;
const WIN_DELAY_MS = 500;

const MemoryMatchGame = ({ onComplete }: { onComplete: (seconds: number) => void }) => {
  const { t } = useTranslation();
  const startedAt = useRef<number | null>(null);
  const [cards, setCards] = useState<MemoryCard[]>(newDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const resetGame = () => {
    startedAt.current = null;
    clearTimer();
    setCards(newDeck());
    setFlipped([]);
    setGameWon(false);
  };

  const handleCardClick = (id: number, at: number) => {
    startedAt.current ??= at;
    const card = cards[id];
    if (!card || card.isFlipped || card.isMatched || flipped.length >= 2 || gameWon) return;

    const nextFlipped = [...flipped, id];
    const nextCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));

    if (nextFlipped.length < 2) {
      setCards(nextCards);
      setFlipped(nextFlipped);
      return;
    }

    const [firstId, secondId] = nextFlipped;
    const first = nextCards.find((c) => c.id === firstId);
    const second = nextCards.find((c) => c.id === secondId);
    const isPair = (c: MemoryCard) => c.id === firstId || c.id === secondId;

    if (first && first.content === second?.content) {
      const matched = nextCards.map((c) => (isPair(c) ? { ...c, isMatched: true } : c));
      setCards(matched);
      setFlipped([]);
      if (matched.every((c) => c.isMatched)) {
        timer.current = setTimeout(() => {
          setGameWon(true);
          onComplete((at - (startedAt.current ?? at)) / 1000);
        }, WIN_DELAY_MS);
      }
    } else {
      setCards(nextCards);
      setFlipped(nextFlipped);
      timer.current = setTimeout(() => {
        setCards((prev) => prev.map((c) => (isPair(c) ? { ...c, isFlipped: false } : c)));
        setFlipped([]);
      }, MISMATCH_DELAY_MS);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 flex w-full max-w-sm items-center justify-between px-4">
        <h2 className="font-bold text-foreground">{t('arcade.findMatches')}</h2>
        <button
          type="button"
          onClick={resetGame}
          className="rounded-full bg-muted p-2 transition-colors hover:bg-secondary"
          title={t('arcade.restart')}
          aria-label={t('arcade.restart')}
        >
          <RefreshCw size={20} className="text-muted-foreground" aria-hidden />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card, index) => {
          const faceUp = card.isFlipped || card.isMatched;
          return (
            <motion.button
              key={card.id}
              type="button"
              initial={false}
              animate={{ rotateY: faceUp ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => handleCardClick(card.id, e.timeStamp)}
              aria-label={faceUp ? card.content : t('arcade.cardFaceDown', { n: index + 1 })}
              aria-pressed={faceUp}
              className="size-16 cursor-pointer rounded-xl [perspective:1000px] sm:size-20"
            >
              <div className="relative h-full w-full text-center [transform-style:preserve-3d]">
                {/* Back of Card (Hidden Face) */}
                <div
                  className={`absolute flex h-full w-full items-center justify-center rounded-xl border-2 border-border bg-secondary backface-hidden ${faceUp ? 'invisible' : 'visible'}`}
                >
                  <span className="text-2xl opacity-20" aria-hidden>
                    ?
                  </span>
                </div>

                {/* Front of Card (Emoji) */}
                <div
                  className={`absolute flex h-full w-full items-center justify-center rounded-xl border-2 bg-card text-3xl shadow-sm backface-hidden ${card.isMatched ? 'border-green-400 bg-green-50 dark:bg-green-950/40' : 'border-primary/50'} ${faceUp ? 'visible' : 'invisible'}`}
                  aria-hidden
                >
                  {card.content}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {gameWon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          role="status"
          className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-card/90"
        >
          <h2 className="mb-4 text-4xl font-bold text-primary">{t('arcade.won')}</h2>
          <p className="mb-6 text-muted-foreground">{t('arcade.wonBody')}</p>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-xl bg-foreground px-8 py-3 font-bold text-background transition-colors hover:bg-foreground/90"
          >
            {t('arcade.playAgain')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ArcadePage;
