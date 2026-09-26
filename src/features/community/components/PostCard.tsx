import { useId, useState } from 'react';
import { EyeOff, Flag, Heart, MessageCircle, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatNumber, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import { CrisisSupport } from '@/features/safety/CrisisSupport';
import {
  communityErrorKey,
  useAddComment,
  useComments,
  useDeletePost,
  useToggleLike,
  type FeedPost,
} from '../api';
import { ReportDialog } from './ReportDialog';

function Comments({ post }: { post: FeedPost }) {
  const { t } = useTranslation();
  const comments = useComments(post.id, true);
  const add = useAddComment(post.id);
  const [body, setBody] = useState('');
  const inputId = useId();

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    add.mutate(text, {
      onSuccess: () => setBody(''),
      onError: (error) => toast.error(t(communityErrorKey(error))),
    });
  };

  return (
    <div className="mt-4 border-t pt-4">
      {comments.isPending ? (
        <Skeleton className="h-12" />
      ) : comments.data && comments.data.length > 0 ? (
        <ul className="space-y-3">
          {comments.data.map((c) => (
            <li key={c.id} className="flex gap-2">
              <Avatar seed={c.alias_display} size={28} />
              <div className="flex-1 rounded-xl bg-muted px-3 py-2">
                <p className="text-xs">
                  <span className="font-semibold">{c.alias_display}</span>
                  <span className="ml-2 text-muted-foreground">{formatRelative(c.created_at)}</span>
                </p>
                <p className="mt-0.5 text-sm whitespace-pre-wrap">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('community.noComments')}</p>
      )}
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          {t('community.writeComment')}
        </label>
        <input
          id={inputId}
          value={body}
          maxLength={1000}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('community.writeComment')}
          className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <Button
          type="submit"
          size="icon"
          aria-label={t('community.sendComment')}
          disabled={!body.trim() || add.isPending}
        >
          <Send aria-hidden />
        </Button>
      </form>
      <CrisisSupport text={body} />
    </div>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const { t } = useTranslation();
  const like = useToggleLike();
  const remove = useDeletePost();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);

  return (
    <article
      className="rounded-2xl border bg-card p-5 shadow-soft"
      aria-labelledby={`post-${post.id}`}
    >
      <header className="flex items-center gap-3">
        <Avatar seed={post.alias_display} size={40} />
        <div className="min-w-0 flex-1">
          <h3 id={`post-${post.id}`} className="truncate font-semibold">
            {post.alias_display}
            {post.is_mine && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({t('community.you')})
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">
            <time dateTime={post.created_at}>{formatRelative(post.created_at)}</time>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={t('community.postActions')}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {post.is_mine ? (
              <DropdownMenuItem
                onSelect={() =>
                  remove.mutate(post.id, {
                    onSuccess: () => toast.success(t('community.deleted')),
                    onError: () => toast.error(t('common.saveFailed')),
                  })
                }
              >
                <Trash2 aria-hidden />
                {t('common.delete')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => setReporting(true)}>
                <Flag aria-hidden />
                {t('community.report')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {post.is_hidden && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-muted p-2 text-xs text-muted-foreground">
          <EyeOff className="size-4" aria-hidden />
          {t('community.hiddenNotice')}
        </p>
      )}

      <p className="mt-4 leading-relaxed whitespace-pre-wrap">{post.body}</p>

      {post.tags.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li key={tag} className="text-xs font-medium text-primary">
              #{t(`community.tags.${tag}` as 'community.tags.exams', { defaultValue: tag })}
            </li>
          ))}
        </ul>
      )}

      <footer className="mt-4 flex items-center gap-2 border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={post.liked_by_me}
          aria-label={t('community.likeLabel', {
            count: post.like_count,
            formatted: formatNumber(post.like_count),
          })}
          onClick={() => like.mutate({ postId: post.id, liked: post.liked_by_me })}
          className={cn(post.liked_by_me && 'text-coral hover:text-coral')}
        >
          <Heart className={cn(post.liked_by_me && 'fill-current')} aria-hidden />
          {formatNumber(post.like_count)}
        </Button>
        <Button variant="ghost" size="sm" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <MessageCircle aria-hidden />
          {t('community.comments', {
            count: post.comment_count,
            formatted: formatNumber(post.comment_count),
          })}
        </Button>
      </footer>

      {open && <Comments post={post} />}
      <ReportDialog open={reporting} onOpenChange={setReporting} postId={post.id} />
    </article>
  );
}
