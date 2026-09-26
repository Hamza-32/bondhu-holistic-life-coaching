import { useId, useMemo, useState } from 'react';
import { Lightbulb, Lock, Plus, Search, Shuffle, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { currentLanguage } from '@/lib/i18n';
import { formatDate, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { MOOD_LEVELS } from '@/features/mood/scale';
import { CrisisSupport } from '@/features/safety/CrisisSupport';
import { EmptyState } from '@/components/EmptyState';
import {
  useDeleteJournalEntry,
  useJournalEntries,
  useJournalPrompts,
  useSaveJournalEntry,
  type JournalEntry,
  type JournalPrompt,
} from './api';

const MAX_BODY = 20000;

interface Draft {
  id?: string;
  title: string;
  body: string;
  promptId: string | null;
  mood: number | null;
}

const EMPTY: Draft = { title: '', body: '', promptId: null, mood: null };

function toDraft(e: JournalEntry): Draft {
  return {
    id: e.id,
    title: e.title ?? '',
    body: e.body,
    promptId: e.prompt_id,
    mood: e.mood_score,
  };
}

function promptText(p: JournalPrompt) {
  return currentLanguage() === 'bn' ? p.text_bn : p.text_en;
}

export function JournalPage() {
  const { t } = useTranslation();
  const entries = useJournalEntries();
  const prompts = useJournalPrompts();
  const save = useSaveJournalEntry();
  const remove = useDeleteJournalEntry();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [search, setSearch] = useState('');
  const [promptIndex, setPromptIndex] = useState(() => Math.floor(Math.random() * 1000));
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const ids = { title: useId(), body: useId(), mood: useId() };

  const prompt = prompts.data?.length ? prompts.data[promptIndex % prompts.data.length] : undefined;
  const activePrompt = prompts.data?.find((p) => p.id === draft.promptId);
  const dirty = draft.body.trim().length > 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entries.data ?? [];
    return (entries.data ?? []).filter(
      (e) => e.body.toLowerCase().includes(q) || (e.title ?? '').toLowerCase().includes(q),
    );
  }, [entries.data, search]);

  /** Open a draft (new or existing); always resets the delete confirmation. */
  const open = (next: Draft) => {
    setConfirmingDelete(false);
    setDraft(next);
  };

  const submit = () => {
    if (!dirty) return;
    save.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),
        title: draft.title.trim() || null,
        body: draft.body.trim(),
        prompt_id: draft.promptId,
        mood_score: draft.mood,
      },
      {
        onSuccess: (entry) => {
          toast.success(t('journal.saved'));
          open(toDraft(entry));
        },
        onError: () => toast.error(t('common.saveFailed')),
      },
    );
  };

  const deleteEntry = () => {
    if (!draft.id) return;
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    remove.mutate(draft.id, {
      onSuccess: () => {
        toast.success(t('journal.deleted'));
        open(EMPTY);
      },
      onError: () => toast.error(t('common.saveFailed')),
    });
  };

  return (
    <div>
      <PageHeader
        title={t('pages.journal.title')}
        subtitle={t('pages.journal.subtitle')}
        actions={
          <Button onClick={() => open(EMPTY)} variant="outline">
            <Plus aria-hidden />
            {t('journal.new')}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        {/* Entry list */}
        <aside aria-labelledby="entries-title" className="order-2 lg:order-1">
          <h2 id="entries-title" className="mb-3 text-sm font-semibold text-muted-foreground">
            {t('journal.entries')}
          </h2>
          <div className="relative mb-3">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('journal.search')}
              aria-label={t('journal.search')}
              className="pl-9"
            />
          </div>
          {entries.isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              illustration={search ? 'search' : 'journal'}
              title={search ? t('journal.noMatches') : t('journal.empty')}
            />
          ) : (
            <ul className="max-h-[32rem] space-y-2 overflow-y-auto pr-1">
              {filtered.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => open(toDraft(e))}
                    aria-current={draft.id === e.id}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition-colors',
                      draft.id === e.id ? 'border-primary bg-secondary' : 'bg-card hover:bg-muted',
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{formatDate(e.created_at)}</p>
                    <p className="mt-1 truncate font-medium">
                      {e.title?.trim() ? e.title : e.body.slice(0, 60)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Editor */}
        <section
          aria-labelledby="editor-title"
          className="order-1 rounded-2xl border bg-card p-6 shadow-soft lg:order-2"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="editor-title" className="text-lg font-semibold">
              {draft.id ? t('journal.editing') : t('journal.newEntry')}
            </h2>
            <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
              <Lock className="size-3.5" aria-hidden />
              {t('journal.private')}
            </p>
          </div>

          {!draft.id && prompt && (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-muted p-4">
              <Lightbulb className="mt-0.5 size-5 shrink-0 text-coral" aria-hidden />
              <div className="flex-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {t('journal.promptLabel')}
                </p>
                <p className="mt-1 font-medium">{promptText(prompt)}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft((d) => ({ ...d, promptId: prompt.id }))}
                  >
                    {t('journal.usePrompt')}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setPromptIndex((i) => i + 1)}>
                    <Shuffle aria-hidden />
                    {t('journal.anotherPrompt')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 space-y-4">
            {activePrompt && (
              <p className="border-l-4 border-coral pl-3 text-sm text-muted-foreground italic">
                {promptText(activePrompt)}
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor={ids.title} className="text-sm font-medium">
                {t('journal.titleLabel')}
              </label>
              <Input
                id={ids.title}
                value={draft.title}
                maxLength={200}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={t('journal.titlePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={ids.body} className="text-sm font-medium">
                {t('journal.bodyLabel')}
              </label>
              <textarea
                id={ids.body}
                value={draft.body}
                maxLength={MAX_BODY}
                rows={12}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder={t('journal.bodyPlaceholder')}
                className="w-full resize-y rounded-lg border border-input bg-background p-4 leading-relaxed focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              />
              <p className="text-right text-xs text-muted-foreground">
                {formatNumber(draft.body.length)} / {formatNumber(MAX_BODY)}
              </p>
              <CrisisSupport text={draft.body} />
            </div>

            <fieldset>
              <legend id={ids.mood} className="text-sm font-medium">
                {t('journal.moodLabel')}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOOD_LEVELS.map((level) => {
                  const Icon = level.icon;
                  const active = draft.mood === level.score;
                  return (
                    <button
                      key={level.score}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDraft((d) => ({ ...d, mood: active ? null : level.score }))}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
                        active ? level.selected : 'hover:bg-muted',
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                      {t(`mood.levels.${level.key}`)}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex gap-2">
                <Button onClick={submit} disabled={!dirty || save.isPending}>
                  {t('journal.save')}
                </Button>
                {draft.id && (
                  <Button variant="ghost" onClick={() => open(EMPTY)}>
                    {t('common.cancel')}
                  </Button>
                )}
              </div>
              {draft.id && (
                <Button
                  variant={confirmingDelete ? 'destructive' : 'ghost'}
                  onClick={deleteEntry}
                  disabled={remove.isPending}
                >
                  <Trash2 aria-hidden />
                  {confirmingDelete ? t('journal.confirmDelete') : t('common.delete')}
                </Button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default JournalPage;
