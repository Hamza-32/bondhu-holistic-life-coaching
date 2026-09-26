import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { communityKeys, TAGS, useFeed, useNewPostSignal, type Tag } from './api';
import { Composer } from './components/Composer';
import { PostCard } from './components/PostCard';

export function CommunityPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tag, setTag] = useState<Tag | null>(null);
  const feed = useFeed(tag);
  const signal = useNewPostSignal();
  const posts = feed.data?.pages.flat() ?? [];

  const showNew = () => {
    signal.reset();
    void queryClient.invalidateQueries({ queryKey: communityKeys.feeds });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chip = (active: boolean) =>
    cn(
      'shrink-0 rounded-full border px-3 py-1 text-sm transition-colors',
      active ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted',
    );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={t('pages.community.title')} subtitle={t('pages.community.subtitle')} />
      <Composer />

      <div
        role="group"
        aria-label={t('community.filterLabel')}
        className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1"
      >
        <button
          type="button"
          aria-pressed={tag === null}
          onClick={() => setTag(null)}
          className={chip(tag === null)}
        >
          {t('community.allTopics')}
        </button>
        {TAGS.map((x) => (
          <button
            key={x}
            type="button"
            aria-pressed={tag === x}
            onClick={() => setTag(x)}
            className={chip(tag === x)}
          >
            #{t(`community.tags.${x}`)}
          </button>
        ))}
      </div>

      {signal.count > 0 && (
        <div className="sticky top-20 z-10 mt-4 flex justify-center">
          <Button size="sm" onClick={showNew} className="rounded-full shadow-lifted">
            <ArrowUp aria-hidden />
            {t('community.newPosts', {
              count: signal.count,
              formatted: formatNumber(signal.count),
            })}
          </Button>
        </div>
      )}

      <div className="mt-4 space-y-4" aria-busy={feed.isPending}>
        {feed.isPending ? (
          <>
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </>
        ) : feed.isError ? (
          <p className="text-destructive">{t('common.loadFailed')}</p>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            {t('community.empty')}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      {feed.hasNextPage && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            onClick={() => void feed.fetchNextPage()}
            disabled={feed.isFetchingNextPage}
          >
            {t('community.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}

export default CommunityPage;
