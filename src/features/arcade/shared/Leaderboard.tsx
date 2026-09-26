import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Avatar } from '@/components/Avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLeaderboard, type GameCode, type LeaderboardMode } from './api';

export function Leaderboard({
  game,
  mode,
  unit,
}: {
  game: GameCode;
  mode: LeaderboardMode;
  unit: string;
}) {
  const { t } = useTranslation();
  const board = useLeaderboard(game, mode);

  return (
    <section aria-labelledby={`lb-${game}`} className="rounded-2xl border bg-card p-5 shadow-soft">
      <h2 id={`lb-${game}`} className="flex items-center gap-2 font-semibold">
        <Trophy className="size-4 text-amber-500" aria-hidden />
        {mode === 'total' ? t('arcade.leaderboard.titleTotal') : t('arcade.leaderboard.titleBest')}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{t('arcade.leaderboard.aliasesOnly')}</p>
      {board.isPending ? (
        <Skeleton className="mt-4 h-40" />
      ) : board.isError ? (
        <p className="mt-4 text-sm text-destructive">{t('common.loadFailed')}</p>
      ) : board.data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('arcade.leaderboard.empty')}</p>
      ) : (
        <ol className="mt-4 space-y-1.5">
          {board.data.map((row) => (
            <li
              key={`${row.rank}-${row.alias}`}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm',
                row.is_me && 'bg-secondary font-semibold',
              )}
            >
              <span className="w-6 text-right text-muted-foreground tabular-nums">
                {formatNumber(row.rank)}
              </span>
              <Avatar seed={row.alias} size={24} />
              <span className="min-w-0 flex-1 truncate">
                {row.alias}
                {row.is_me && (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({t('community.you')})
                  </span>
                )}
              </span>
              <span className="tabular-nums">
                {formatNumber(row.score)}{' '}
                <span className="text-xs text-muted-foreground">{unit}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
