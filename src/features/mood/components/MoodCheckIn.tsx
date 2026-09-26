import { useId, useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EMOTIONS, useLogMood, type Emotion } from '../api';
import { MOOD_LEVELS } from '../scale';

/** One-tap mood check-in with optional emotions and note. */
export function MoodCheckIn({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation();
  const logMood = useLogMood();
  const [score, setScore] = useState<number | null>(null);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [note, setNote] = useState('');
  const noteId = useId();
  const groupId = useId();

  const reset = () => {
    setScore(null);
    setEmotions([]);
    setNote('');
  };

  const submit = () => {
    if (score === null) return;
    logMood.mutate(
      { score, emotion_tags: emotions, note: note.trim() || null },
      {
        onSuccess: () => {
          toast.success(t('mood.saved'));
          reset();
        },
        onError: () => toast.error(t('common.saveFailed')),
      },
    );
  };

  const toggleEmotion = (e: Emotion) =>
    setEmotions((current) =>
      current.includes(e)
        ? current.filter((x) => x !== e)
        : current.length < 10
          ? [...current, e]
          : current,
    );

  return (
    <div>
      <p id={groupId} className="font-semibold">
        {t('mood.question')}
      </p>
      {/* Native radios: arrow-key navigation and screen-reader semantics for free. */}
      <div role="radiogroup" aria-labelledby={groupId} className="mt-3 grid grid-cols-5 gap-2">
        {MOOD_LEVELS.map((level) => {
          const Icon = level.icon;
          const active = score === level.score;
          return (
            <label
              key={level.score}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1 rounded-xl border px-1 py-3 text-xs font-medium transition-all has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50',
                active
                  ? level.selected
                  : 'border-transparent bg-muted text-muted-foreground hover:bg-secondary',
              )}
            >
              <input
                type="radio"
                name={groupId}
                value={level.score}
                checked={active}
                onChange={() => setScore(level.score)}
                className="sr-only"
              />
              <Icon className="size-6" aria-hidden />
              <span className="w-full truncate text-center">{t(`mood.levels.${level.key}`)}</span>
            </label>
          );
        })}
      </div>

      {score === null && !compact && (
        <p className="mt-4 text-sm text-muted-foreground">{t('mood.hint')}</p>
      )}

      {score !== null && (
        <div className="mt-5 animate-in space-y-4 duration-300 fade-in slide-in-from-top-2">
          {!compact && (
            <fieldset>
              <legend className="text-sm font-medium">{t('mood.emotionsLabel')}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {EMOTIONS.map((e) => {
                  const active = emotions.includes(e);
                  return (
                    <button
                      key={e}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleEmotion(e)}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors',
                        active ? 'border-primary bg-secondary text-primary' : 'hover:bg-muted',
                      )}
                    >
                      {active && <Check className="size-3.5" aria-hidden />}
                      {t(`mood.emotions.${e}`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          {!compact && (
            <div className="space-y-2">
              <label htmlFor={noteId} className="text-sm font-medium">
                {t('mood.noteLabel')}
              </label>
              <textarea
                id={noteId}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                rows={2}
                placeholder={t('mood.notePlaceholder')}
                className="w-full resize-none rounded-lg border border-input bg-background p-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button onClick={submit} disabled={logMood.isPending}>
              {t('mood.save')}
            </Button>
            <Button variant="ghost" onClick={reset}>
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
