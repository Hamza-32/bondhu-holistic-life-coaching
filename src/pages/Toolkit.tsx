import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { Smile, Meh, Frown, Check, Briefcase, FileText } from 'lucide-react';
import { CareerQuiz } from '@/components/CareerQuiz';
import { ResumeBuilder } from '@/components/ResumeBuilder';

export const Toolkit = () => {
  const { t } = useTranslation();
  const { logMood } = useBondhuStore();
  const [moodLogged, setMoodLogged] = useState(false);
  const [activeTool, setActiveTool] = useState<'mood' | 'quiz' | 'resume'>('mood');

  const handleMood = (mood: 'happy' | 'neutral' | 'stressed') => {
    logMood(mood);
    setMoodLogged(true);
    setTimeout(() => setMoodLogged(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Tool Navigation */}
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">
        <button
          onClick={() => setActiveTool('mood')}
          aria-pressed={activeTool === 'mood'}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold whitespace-nowrap transition-all ${activeTool === 'mood' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Smile size={20} aria-hidden /> {t('pages.toolkit.mood')}
        </button>
        <button
          onClick={() => setActiveTool('quiz')}
          aria-pressed={activeTool === 'quiz'}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold whitespace-nowrap transition-all ${activeTool === 'quiz' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Briefcase size={20} aria-hidden /> {t('pages.toolkit.quiz')}
        </button>
        <button
          onClick={() => setActiveTool('resume')}
          aria-pressed={activeTool === 'resume'}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-bold whitespace-nowrap transition-all ${activeTool === 'resume' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <FileText size={20} aria-hidden /> {t('pages.toolkit.resume')}
        </button>
      </div>

      <div className="min-h-[500px]">
        {activeTool === 'mood' && (
          <section className="animate-in rounded-2xl border border-border bg-card p-6 text-center shadow-sm duration-500 fade-in slide-in-from-bottom-4 sm:p-12">
            <h2 className="mb-6 text-3xl font-bold text-foreground">How are you feeling today?</h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Tracking your emotions is the first step to mastering them.
            </p>

            {moodLogged ? (
              <div className="flex animate-in flex-col items-center py-8 text-green-600 fade-in zoom-in dark:text-green-400">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                  <Check className="h-10 w-10" />
                </div>
                <p className="text-2xl font-bold">Logged! Thanks for checking in.</p>
                <button
                  onClick={() => setMoodLogged(false)}
                  className="mt-6 text-muted-foreground underline hover:text-primary"
                >
                  Log another emotion
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-8">
                <button
                  onClick={() => handleMood('happy')}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-3xl border-2 border-transparent bg-green-50 shadow-sm transition-transform group-hover:scale-110 group-hover:border-green-200 dark:bg-green-950/40">
                    <Smile className="h-12 w-12 text-green-500" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Great</span>
                </button>
                <button
                  onClick={() => handleMood('neutral')}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-3xl border-2 border-transparent bg-yellow-50 shadow-sm transition-transform group-hover:scale-110 group-hover:border-yellow-200 dark:bg-yellow-950/40">
                    <Meh className="h-12 w-12 text-yellow-500" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Okay</span>
                </button>
                <button
                  onClick={() => handleMood('stressed')}
                  className="group flex flex-col items-center gap-4"
                >
                  <div className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-3xl border-2 border-transparent bg-red-50 shadow-sm transition-transform group-hover:scale-110 group-hover:border-red-200 dark:bg-red-950/40">
                    <Frown className="h-12 w-12 text-red-500" />
                  </div>
                  <span className="text-lg font-bold text-foreground">Stressed</span>
                </button>
              </div>
            )}
          </section>
        )}

        {activeTool === 'quiz' && (
          <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Career Compass 🧭</h2>
              <p className="text-muted-foreground">Discover a path that fits your personality.</p>
            </div>
            <CareerQuiz />
          </div>
        )}

        {activeTool === 'resume' && (
          <div className="animate-in duration-500 fade-in slide-in-from-bottom-4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Resume Builder 📄</h2>
              <p className="text-muted-foreground">Create a clean, professional CV in minutes.</p>
            </div>
            <ResumeBuilder />
          </div>
        )}
      </div>
    </div>
  );
};
