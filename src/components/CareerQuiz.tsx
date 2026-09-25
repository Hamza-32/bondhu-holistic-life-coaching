import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: 'What energizes you the most?',
    options: [
      { text: 'Solving complex logic puzzles', type: 'tech' },
      { text: 'Helping people solve their problems', type: 'social' },
      { text: 'Designing or creating something visual', type: 'creative' },
      { text: 'Organizing and leading a team', type: 'business' },
    ],
  },
  {
    id: 2,
    question: 'If you could pick a superpower, what would it be?',
    options: [
      { text: 'Super intelligence to code anything', type: 'tech' },
      { text: 'Mind reading to understand emotions', type: 'social' },
      { text: 'Ability to conjure beautiful art', type: 'creative' },
      { text: 'Persuasion to influence masterfully', type: 'business' },
    ],
  },
  {
    id: 3,
    question: "What's your ideal work environment?",
    options: [
      { text: 'Quiet room with multiple monitors', type: 'tech' },
      { text: 'Bustling community center or hospital', type: 'social' },
      { text: 'Bright studio with music playing', type: 'creative' },
      { text: 'High-rise office meeting room', type: 'business' },
    ],
  },
];

const results: Record<string, { title: string; description: string }> = {
  tech: {
    title: 'Tech Innovator',
    description:
      'You thrive on logic and problem-solving. Consider Software Engineering, Data Science, or Cybersecurity.',
  },
  social: {
    title: 'Social Changemaker',
    description:
      'You have a heart for people. Psychology, Counseling, HR, or Nursing might be your calling.',
  },
  creative: {
    title: 'Creative Visionary',
    description:
      'You see the world in colors and shapes. UX Design, Architecture, or Media could be perfect.',
  },
  business: {
    title: 'Business Leader',
    description:
      'You have a knack for strategy. Management, Marketing, or Entrepreneurship suits you well.',
  },
};

export const CareerQuiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ title: string; description: string } | null>(null);
  const question = questions[currentStep];

  const handleAnswer = (type: string) => {
    const newAnswers = [...answers, type];
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = (finalAnswers: string[]) => {
    // Simple majority count
    const counts: Record<string, number> = {};
    finalAnswers.forEach((type) => {
      counts[type] = (counts[type] ?? 0) + 1;
    });

    const winner = Object.keys(counts).reduce((a, b) =>
      (counts[a] ?? 0) >= (counts[b] ?? 0) ? a : b,
    );
    setResult(results[winner] ?? null);
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="flex min-h-[400px] flex-col justify-center rounded-2xl border border-border bg-card p-8 shadow-sm">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="question"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>Career Compass</span>
            </div>

            <h3 className="text-2xl font-bold text-foreground">{question?.question}</h3>

            <div className="space-y-3">
              {question?.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option.type)}
                  className="group flex w-full items-center justify-between rounded-xl border border-border p-4 text-left font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10"
                >
                  {option.text}
                  <ArrowRight
                    className="text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    size={18}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400">
              <CheckCircle size={40} />
            </div>
            <div>
              <p className="mb-2 text-sm font-bold tracking-wide text-muted-foreground uppercase">
                You might be a
              </p>
              <h2 className="text-3xl font-extrabold text-foreground">{result.title}</h2>
            </div>
            <p className="mx-auto max-w-md text-lg leading-relaxed text-muted-foreground">
              {result.description}
            </p>

            <button
              onClick={resetQuiz}
              className="inline-flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <RefreshCw size={16} /> Retake Quiz
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
