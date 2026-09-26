import { useId, useState } from 'react';
import { Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useProfile } from '@/features/profile/api';
import { TAGS, useCreatePost, type Tag } from '../api';

const MAX = 2000;

export function Composer() {
  const { t } = useTranslation();
  const profile = useProfile();
  const create = useCreatePost();
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [anonymous, setAnonymous] = useState(true);
  const bodyId = useId();
  const anonId = useId();
  const alias = profile.data?.anonymous_alias ?? '';
  const shownAs = anonymous ? alias : (profile.data?.display_name ?? '');

  const toggleTag = (tag: Tag) =>
    setTags((current) =>
      current.includes(tag)
        ? current.filter((x) => x !== tag)
        : current.length < 5
          ? [...current, tag]
          : current,
    );

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    create.mutate(
      { body: text, tags, is_anonymous: anonymous },
      {
        onSuccess: () => {
          setBody('');
          setTags([]);
          toast.success(t('community.posted'));
        },
        onError: () => toast.error(t('common.saveFailed')),
      },
    );
  };

  return (
    <section
      aria-labelledby="composer-title"
      className="rounded-2xl border bg-card p-5 shadow-soft"
    >
      <h2 id="composer-title" className="sr-only">
        {t('community.newPost')}
      </h2>
      <div className="flex gap-3">
        <Avatar
          seed={anonymous ? alias : (profile.data?.avatar_seed ?? alias)}
          size={40}
          className="hidden sm:block"
        />
        <div className="flex-1">
          <label htmlFor={bodyId} className="sr-only">
            {t('community.newPost')}
          </label>
          <textarea
            id={bodyId}
            value={body}
            maxLength={MAX}
            rows={3}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('community.placeholder')}
            className="w-full resize-none rounded-lg border border-input bg-background p-3 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
          <div
            className="mt-2 flex flex-wrap gap-1.5"
            role="group"
            aria-label={t('community.tagsLabel')}
          >
            {TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                  tags.includes(tag)
                    ? 'border-primary bg-secondary text-primary'
                    : 'hover:bg-muted',
                )}
              >
                #{t(`community.tags.${tag}`)}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor={anonId} className="flex items-center gap-2 text-sm">
              <input
                id={anonId}
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="size-4 accent-[var(--primary)]"
              />
              {t('community.postAnonymously')}
              <span className="text-muted-foreground">
                ({t('community.shownAs', { name: shownAs })})
              </span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {formatNumber(body.length)}/{formatNumber(MAX)}
              </span>
              <Button onClick={submit} disabled={!body.trim() || create.isPending}>
                <Send aria-hidden />
                {t('community.post')}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{t('community.guidelines')}</p>
    </section>
  );
}
