import { CheckCircle2, Circle, Flame, Sparkles, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/format';
import { currentLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { Profile } from '@/features/profile/api';
import { useCompleteQuest, useMyQuests } from './api';
import { levelProgress } from './level';

export function LevelCard({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const progress = levelProgress(profile.xp);
  return (
    <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs tracking-wider text-white/85 uppercase">
          {t('pages.dashboard.currentLevel')}
        </p>
        <Trophy className="size-5 text-amber-300" aria-hidden />
      </div>
      <p className="mt-1 text-4xl font-extrabold">{formatNumber(profile.level)}</p>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-black/20"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={progress.needed}
        aria-valuenow={progress.into}
        aria-label={t('gamification.progressLabel')}
      >
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-white/85">
        {t('gamification.toNext', {
          into: formatNumber(progress.into),
          needed: formatNumber(progress.needed),
        })}
      </p>
    </div>
  );
}

export function StreakChip({ streak }: { streak: number }) {
  const { t } = useTranslation();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1 text-sm font-semibold text-coral">
      <Flame className="size-4" aria-hidden />
      {t('user.streak', { count: streak, formatted: formatNumber(streak) })}
    </span>
  );
}

export function QuestList() {
  const { t } = useTranslation();
  const quests = useMyQuests();
  const complete = useCompleteQuest();
  const bn = currentLanguage() === 'bn';

  if (quests.isPending) return <Skeleton className="h-48" />;
  if (quests.isError) return <p className="text-sm text-destructive">{t('common.loadFailed')}</p>;

  return (
    <ul className="space-y-2">
      {quests.data.map((q) => (
        <li
          key={q.id}
          className={cn(
            'flex items-center gap-3 rounded-xl border p-3',
            q.completed ? 'border-primary/30 bg-secondary/60' : 'bg-card',
          )}
        >
          {q.completed ? (
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden />
          ) : (
            <Circle className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <p className={cn('font-medium', q.completed && 'text-muted-foreground line-through')}>
              {bn ? q.title_bn : q.title_en}
              <span className="sr-only">{q.completed ? ` (${t('gamification.done')})` : ''}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {q.type === 'weekly' ? t('gamification.weekly') : t('gamification.daily')}
              {!q.completed && q.completion === 'auto' && ` · ${t('gamification.autoHint')}`}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
            <Sparkles className="size-3" aria-hidden />+{formatNumber(q.xp_reward)}
          </span>
          {!q.completed && q.completion === 'manual' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                complete.mutate(q.code, { onError: () => toast.error(t('common.saveFailed')) })
              }
            >
              {t('gamification.markDone')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
