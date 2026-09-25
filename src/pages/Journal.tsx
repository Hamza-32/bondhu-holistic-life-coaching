import { useState, type SubmitEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useBondhuStore } from '@/stores/useBondhuStore';
import { Book, PenTool, Smile, Frown, Meh, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Journal = () => {
  const { t } = useTranslation();
  const { journalEntries, addJournalEntry } = useBondhuStore();
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');

  const moods = [
    {
      id: 'happy',
      icon: Smile,
      label: 'Happy',
      color: 'text-green-600 dark:text-green-400',
      ring: 'ring-green-300 dark:ring-green-700',
      bg: 'bg-green-50 dark:bg-green-950/40',
    },
    {
      id: 'neutral',
      icon: Meh,
      label: 'Neutral',
      color: 'text-yellow-600 dark:text-yellow-400',
      ring: 'ring-yellow-300 dark:ring-yellow-700',
      bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    },
    {
      id: 'sad',
      icon: Frown,
      label: 'Sad',
      color: 'text-blue-600 dark:text-blue-400',
      ring: 'ring-blue-300 dark:ring-blue-700',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
    },
  ];

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim()) return;

    addJournalEntry(content, selectedMood);
    setContent('');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="mb-8 text-center">
        <h1 className="flex items-center justify-center gap-3 text-3xl font-bold text-foreground">
          <Book className="text-primary" aria-hidden />
          {t('pages.journal.title')}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('pages.journal.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Compose Area */}
        <div className="md:col-span-2">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <PenTool size={20} className="text-muted-foreground" />
              Write Entry
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-label="Journal entry"
                placeholder="How are you feeling today? What's on your mind?"
                className="h-48 w-full resize-none rounded-xl border border-border p-4 font-serif text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/30 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={`rounded-lg p-2 transition-all ${selectedMood === m.id ? `${m.bg} ring-2 ring-offset-2 ring-offset-card ${m.ring}` : 'hover:bg-muted'}`}
                      title={m.label}
                      aria-label={m.label}
                      aria-pressed={selectedMood === m.id}
                    >
                      <m.icon
                        className={`h-6 w-6 ${selectedMood === m.id ? m.color : 'text-muted-foreground'}`}
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="rounded-xl bg-primary px-6 py-2 font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* History / Recent */}
        <div className="md:col-span-1">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
            <Calendar size={20} className="text-muted-foreground" />
            Recent Entries
          </h2>
          <div className="space-y-4">
            <AnimatePresence>
              {journalEntries.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted p-8 text-center">
                  <p className="text-sm text-muted-foreground">No entries yet. Start writing!</p>
                </div>
              ) : (
                journalEntries.slice(0, 5).map((entry) => {
                  const MoodIcon = moods.find((m) => m.id === entry.mood)?.icon;
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/20"
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                        {MoodIcon && (
                          <MoodIcon size={16} className="text-muted-foreground" aria-hidden />
                        )}
                      </div>
                      <p className="line-clamp-3 font-serif text-sm text-foreground">
                        {entry.content}
                      </p>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
