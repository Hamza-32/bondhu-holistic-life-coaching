import { useMemo, useState } from 'react';
import { TrendingDown, TrendingUp, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { dailyAverages, overallAverage, trend } from './aggregate';
import { useDeleteMood, useMoodEntries } from './api';
import { LazyMoodChart as MoodChart } from './components/LazyMoodChart';
import { MoodCheckIn } from './components/MoodCheckIn';
import { moodLevel } from './scale';

const RANGES = [7, 30, 90] as const;

export function MoodPage() {
  const { t } = useTranslation();
  const [days, setDays] = useState<(typeof RANGES)[number]>(7);
  const entries = useMoodEntries(days);
  const deleteMood = useDeleteMood();

  const points = useMemo(() => dailyAverages(entries.data ?? [], days), [entries.data, days]);
  const average = overallAverage(points);
  const change = trend(points);

  return (
    <div>
      <PageHeader title={t('mood.title')} subtitle={t('mood.subtitle')} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section
          aria-labelledby="checkin-title"
          className="rounded-2xl border bg-card p-6 shadow-soft"
        >
          <h2 id="checkin-title" className="sr-only">
            {t('mood.checkIn')}
          </h2>
          <MoodCheckIn />
        </section>

        <section
          aria-labelledby="trend-title"
          className="rounded-2xl border bg-card p-6 shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="trend-title" className="font-semibold">
              {t('mood.trendTitle')}
            </h2>
            <div
              role="group"
              aria-label={t('mood.rangeLabel')}
              className="flex rounded-lg bg-muted p-1 text-sm"
            >
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={days === r}
                  onClick={() => setDays(r)}
                  className={cn(
                    'rounded-md px-3 py-1 font-medium transition-colors',
                    days === r
                      ? 'bg-card shadow-soft'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {t('mood.rangeDays', { days: formatNumber(r) })}
                </button>
              ))}
            </div>
          </div>

          {entries.isPending ? (
            <Skeleton className="mt-6 h-56" />
          ) : entries.isError ? (
            <p className="mt-6 text-sm text-destructive">{t('common.loadFailed')}</p>
          ) : entries.data.length === 0 ? (
            <p className="mt-6 rounded-xl bg-muted p-6 text-center text-muted-foreground">
              {t('mood.empty')}
            </p>
          ) : (
            <>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">{t('mood.stats.average')}</dt>
                  <dd className="mt-1 text-xl font-bold">
                    {average === null ? '–' : formatNumber(average)}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">{t('mood.stats.trend')}</dt>
                  <dd className="mt-1 flex items-center justify-center gap-1 text-xl font-bold">
                    {change === null ? (
                      '–'
                    ) : (
                      <>
                        {change >= 0 ? (
                          <TrendingUp className="size-5 text-primary" aria-hidden />
                        ) : (
                          <TrendingDown className="size-5 text-coral" aria-hidden />
                        )}
                        {formatNumber(change)}
                      </>
                    )}
                  </dd>
                </div>
                <div className="rounded-xl bg-muted p-3">
                  <dt className="text-xs text-muted-foreground">{t('mood.stats.entries')}</dt>
                  <dd className="mt-1 text-xl font-bold">{formatNumber(entries.data.length)}</dd>
                </div>
              </dl>
              <div className="mt-4">
                <MoodChart points={points} days={days} />
              </div>
            </>
          )}
        </section>
      </div>

      <section aria-labelledby="history-title" className="mt-8">
        <h2 id="history-title" className="mb-4 text-lg font-semibold">
          {t('mood.history')}
        </h2>
        {entries.data && entries.data.length > 0 ? (
          <ul className="space-y-3">
            {entries.data.slice(0, 20).map((entry) => {
              const level = moodLevel(entry.score);
              const Icon = level.icon;
              return (
                <li key={entry.id} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                  <span
                    className={cn(
                      'flex size-10 shrink-0 items-center justify-center rounded-full border',
                      level.selected,
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {t(`mood.levels.${level.key}`)}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">
                        {formatDateTime(entry.created_at)}
                      </span>
                    </p>
                    {entry.emotion_tags.length > 0 && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {entry.emotion_tags
                          .map((e) =>
                            t(`mood.emotions.${e}` as 'mood.emotions.happy', { defaultValue: e }),
                          )
                          .join(' · ')}
                      </p>
                    )}
                    {entry.note && <p className="mt-2 text-sm whitespace-pre-wrap">{entry.note}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('common.delete')}
                    onClick={() =>
                      deleteMood.mutate(entry.id, {
                        onError: () => toast.error(t('common.saveFailed')),
                      })
                    }
                  >
                    <Trash2 aria-hidden />
                  </Button>
                </li>
              );
            })}
          </ul>
        ) : (
          !entries.isPending && <p className="text-muted-foreground">{t('mood.empty')}</p>
        )}
      </section>
    </div>
  );
}

export default MoodPage;
