import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { RefreshCw } from 'lucide-react';

export const Arcade = () => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'pop' | 'memory'>('breathe');
  const { t } = useTranslation();
  const addXp = useBondhuStore((state) => state.addXp);

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="mb-2 text-3xl font-bold text-foreground">
        {t('pages.arcade.title')} <span aria-hidden>🎮</span>
      </h1>
      <p className="mb-8 text-muted-foreground">{t('pages.arcade.subtitle')}</p>

      <div className="mb-10 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setActiveTab('breathe')}
          aria-pressed={activeTab === 'breathe'}
          className={`rounded-full px-6 py-2 font-medium transition-all ${activeTab === 'breathe' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          Breathing
        </button>
        <button
          onClick={() => setActiveTab('pop')}
          aria-pressed={activeTab === 'pop'}
          className={`rounded-full px-6 py-2 font-medium transition-all ${activeTab === 'pop' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          Stress Popper
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          aria-pressed={activeTab === 'memory'}
          className={`rounded-full px-6 py-2 font-medium transition-all ${activeTab === 'memory' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          Memory Match
        </button>
      </div>

      <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-8 md:p-12">
        {activeTab === 'breathe' && (
          <BreathingGame onComplete={() => addXp(50, 'Breathing Session')} />
        )}
        {activeTab === 'pop' && <StressPopper onPop={() => addXp(5, 'Pop!')} />}
        {activeTab === 'memory' && (
          <MemoryMatchGame onComplete={() => addXp(100, 'Memory Master')} />
        )}
      </div>
    </div>
  );
};

const BreathingGame = ({ onComplete }: { onComplete: () => void }) => {
  const [text, setText] = useState('Inhale');

  useEffect(() => {
    const timer = setInterval(() => {
      setText((prev) => (prev === 'Inhale' ? 'Exhale' : 'Inhale'));
    }, 4000);

    // Simulate completion reward after 12s
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 12000);

    return () => {
      clearInterval(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

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
      <p className="mt-8 text-muted-foreground">Follow the circle. Breathe in deeply...</p>
    </div>
  );
};

const BUBBLE_COUNT = 16;
const BUBBLE_RESET_MS = 2000;

const StressPopper = ({ onPop }: { onPop: () => void }) => {
  const [bubbles, setBubbles] = useState<boolean[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, () => false),
  );
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const popBubble = (index: number) => {
    if (bubbles[index]) return;
    setBubbles((prev) => prev.map((popped, i) => (i === index ? true : popped)));
    onPop();

    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setBubbles((prev) => prev.map((popped, i) => (i === index ? false : popped)));
    }, BUBBLE_RESET_MS);
    timers.current.add(timer);
  };

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4">
      {bubbles.map((popped, i) => (
        <button
          key={i}
          type="button"
          onClick={() => popBubble(i)}
          aria-label={popped ? `Bubble ${i + 1}, popped` : `Pop bubble ${i + 1}`}
          className={`size-14 transform rounded-full shadow-inner transition-all duration-200 active:scale-90 sm:size-16 ${
            popped ? 'scale-95 bg-secondary shadow-none' : 'bg-coral/80 shadow-lg hover:bg-coral'
          }`}
        />
      ))}
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

const MemoryMatchGame = ({ onComplete }: { onComplete: () => void }) => {
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
    clearTimer();
    setCards(newDeck());
    setFlipped([]);
    setGameWon(false);
  };

  const handleCardClick = (id: number) => {
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
          onComplete();
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
        <h2 className="font-bold text-foreground">Find Matches</h2>
        <button
          type="button"
          onClick={resetGame}
          className="rounded-full bg-muted p-2 transition-colors hover:bg-secondary"
          title="Restart Game"
          aria-label="Restart game"
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
              onClick={() => handleCardClick(card.id)}
              aria-label={faceUp ? card.content : `Card ${index + 1}, face down`}
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
          <h2 className="mb-4 text-4xl font-bold text-primary">You Won! 🎉</h2>
          <p className="mb-6 text-muted-foreground">+100 XP Earned</p>
          <button
            type="button"
            onClick={resetGame}
            className="rounded-xl bg-foreground px-8 py-3 font-bold text-background transition-colors hover:bg-foreground/90"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
};
