import { useState } from 'react';
import { ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { useSaveQuizResult, type Archetype } from '../api';
import { scoreQuiz } from './score';

const QUESTIONS = ['energy', 'superpower', 'environment'] as const;
const OPTIONS: readonly Archetype[] = ['tech', 'social', 'creative', 'business'];

export function CareerQuiz() {
  const { t } = useTranslation();
  const saveResult = useSaveQuizResult();
  const [answers, setAnswers] = useState<Archetype[]>([]);
  const step = answers.length;
  const done = step >= QUESTIONS.length;
  const result = done ? scoreQuiz(answers) : null;
  const question = QUESTIONS[step];

  const answer = (a: Archetype) => {
    const next = [...answers, a];
    setAnswers(next);
    if (next.length === QUESTIONS.length) {
      saveResult.mutate({ archetype: scoreQuiz(next), answers: next });
    }
  };

  return (
    <div className="flex min-h-[24rem] flex-col justify-center rounded-2xl border bg-card p-6 shadow-soft sm:p-8">
      <AnimatePresence mode="wait">
        {!done && question ? (
          <motion.div
            key={question}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <p className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              {t('quiz.progress', {
                step: formatNumber(step + 1),
                total: formatNumber(QUESTIONS.length),
              })}
            </p>
            <h3 className="text-2xl font-bold">{t(`quiz.questions.${question}.q`)}</h3>
            <div className="space-y-3">
              {OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => answer(a)}
                  className="group flex w-full items-center justify-between rounded-xl border p-4 text-left font-medium transition-colors hover:border-primary hover:bg-secondary"
                >
                  {t(`quiz.questions.${question}.${a}`)}
                  <ArrowRight
                    className="size-4 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5 text-center"
            role="status"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckCircle className="size-8" aria-hidden />
            </div>
            <p className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {t('quiz.youMightBe')}
            </p>
            <h3 className="text-3xl font-extrabold">{t(`quiz.results.${result}.title`)}</h3>
            <p className="mx-auto max-w-md text-muted-foreground">
              {t(`quiz.results.${result}.body`)}
            </p>
            <p className="mx-auto max-w-md text-xs text-muted-foreground">{t('quiz.disclaimer')}</p>
            <Button variant="ghost" onClick={() => setAnswers([])}>
              <RefreshCw aria-hidden />
              {t('quiz.retake')}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
