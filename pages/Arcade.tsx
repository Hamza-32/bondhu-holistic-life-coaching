import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBondhuStore } from '../store/useBondhuStore';
import { RefreshCw } from 'lucide-react';

export const Arcade = () => {
  const [activeTab, setActiveTab] = useState<'breathe' | 'pop' | 'memory'>('breathe');
  const addXp = useBondhuStore(state => state.addXp);

  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">The Arcade 🎮</h1>
      <p className="text-slate-600 mb-8">Take a break. Relax your mind.</p>

      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        <button
          onClick={() => setActiveTab('breathe')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'breathe' ? 'bg-bondhu-red text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          Breathing
        </button>
        <button
          onClick={() => setActiveTab('pop')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'pop' ? 'bg-bondhu-red text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          Stress Popper
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`px-6 py-2 rounded-full font-medium transition-all ${activeTab === 'memory' ? 'bg-bondhu-red text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
        >
          Memory Match
        </button>
      </div>

      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 min-h-[400px] flex items-center justify-center relative overflow-visible">
        {activeTab === 'breathe' && <BreathingGame onComplete={() => addXp(50, "Breathing Session")} />}
        {activeTab === 'pop' && <StressPopper onPop={() => addXp(5, "Pop!")} />}
        {activeTab === 'memory' && <MemoryMatchGame onComplete={() => addXp(100, "Memory Master")} />}
      </div>
    </div>
  );
};

const BreathingGame = ({ onComplete }: { onComplete: () => void }) => {
  const [text, setText] = useState('Inhale');

  useEffect(() => {
    const timer = setInterval(() => {
      setText(prev => prev === 'Inhale' ? 'Exhale' : 'Inhale');
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
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-48 h-48 bg-blue-400 rounded-full blur-xl absolute"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 8,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="w-48 h-48 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-2xl z-10"
      >
        {text}
      </motion.div>
      <p className="mt-8 text-slate-500">Follow the circle. Breathe in deeply...</p>
    </div>
  );
};

const StressPopper = ({ onPop }: { onPop: () => void }) => {
  const [bubbles, setBubbles] = useState(Array(16).fill(false));

  const popBubble = (index: number) => {
    if (!bubbles[index]) {
      const newBubbles = [...bubbles];
      newBubbles[index] = true;
      setBubbles(newBubbles);
      onPop();

      // Reset bubble after 1 sec
      setTimeout(() => {
        setBubbles(prev => {
          const reset = [...prev];
          reset[index] = false;
          return reset;
        })
      }, 2000);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      {bubbles.map((popped, i) => (
        <button
          key={i}
          onClick={() => popBubble(i)}
          className={`w-16 h-16 rounded-full shadow-inner transition-all duration-200 transform active:scale-90 ${popped ? 'bg-slate-200 scale-95 shadow-none' : 'bg-red-400 hover:bg-red-500 shadow-lg'
            }`}
        >
        </button>
      ))}
    </div>
  );
};

// Memory Match Game
const emojis = ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊'];
const cardItems = [...emojis, ...emojis];

const MemoryMatchGame = ({ onComplete }: { onComplete: () => void }) => {
  const [cards, setCards] = useState<{ id: number, content: string, isFlipped: boolean, isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matches, setMatches] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffled = [...cardItems]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setGameWon(false);
  };

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      if (cards[first].content === cards[second].content) {
        setCards(prev => prev.map(card =>
          card.id === first || card.id === second ? { ...card, isMatched: true } : card
        ));
        setMatches(prev => prev + 1);
        setFlippedCards([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(card =>
            card.id === first || card.id === second ? { ...card, isFlipped: false } : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards]);

  useEffect(() => {
    if (matches === emojis.length && matches > 0) {
      setTimeout(() => {
        setGameWon(true);
        onComplete();
      }, 500);
    }
  }, [matches, onComplete]);

  const handleCardClick = (id: number) => {
    if (flippedCards.length < 2 && !cards[id].isFlipped && !cards[id].isMatched) {
      setCards(prev => prev.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      ));
      setFlippedCards(prev => [...prev, id]);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-sm mb-6 px-4">
        <h3 className="font-bold text-slate-700">Find Matches</h3>
        <button
          onClick={initializeGame}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          title="Restart Game"
        >
          <RefreshCw size={20} className="text-slate-600" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {cards.map(card => (
          <motion.div
            key={card.id}
            initial={false}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleCardClick(card.id)}
            className="w-16 h-16 sm:w-20 sm:h-20 cursor-pointer perspective-1000"
          >
            <div className="relative w-full h-full text-center" style={{ transformStyle: 'preserve-3d' }}>
              {/* Back of Card (Hidden Face) */}
              <div
                className={`absolute w-full h-full bg-slate-200 rounded-xl backface-hidden flex items-center justify-center border-2 border-slate-300 ${card.isFlipped || card.isMatched ? 'invisible' : 'visible'}`}
              >
                <span className="text-2xl opacity-20">?</span>
              </div>

              {/* Front of Card (Emoji) */}
              <div
                className={`absolute w-full h-full bg-white rounded-xl backface-hidden flex items-center justify-center text-3xl shadow-sm border-2 ${card.isMatched ? 'border-green-400 bg-green-50' : 'border-bondhu-red/50'} ${card.isFlipped || card.isMatched ? 'visible' : 'invisible'}`}
              >
                {card.content}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {gameWon && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center rounded-3xl"
        >
          <h2 className="text-4xl font-bold text-bondhu-red mb-4">You Won! 🎉</h2>
          <p className="text-slate-600 mb-6">+100 XP Earned</p>
          <button
            onClick={initializeGame}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
          >
            Play Again
          </button>
        </motion.div>
      )}
    </div>
  );
};
