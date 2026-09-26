import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tables } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type JournalEntry = Tables<'journal_entries'>;
export type JournalPrompt = Tables<'journal_prompts'>;

export const journalKeys = {
  all: ['journal'] as const,
  prompts: ['journal', 'prompts'] as const,
};

const ENTRY_COLUMNS = 'id, user_id, title, body, prompt_id, mood_score, created_at, updated_at';

export function useJournalEntries() {
  return useQuery({
    queryKey: journalKeys.all,
    queryFn: async (): Promise<JournalEntry[]> => {
      const { data, error } = await requireSupabase()
        .from('journal_entries')
        .select(ENTRY_COLUMNS)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

export function useJournalPrompts() {
  return useQuery({
    queryKey: journalKeys.prompts,
    queryFn: async (): Promise<JournalPrompt[]> => {
      const { data, error } = await requireSupabase().from('journal_prompts').select('*');
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
  });
}

export interface JournalDraft {
  id?: string;
  title: string | null;
  body: string;
  prompt_id: string | null;
  mood_score: number | null;
}

export function useSaveJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: JournalDraft): Promise<JournalEntry> => {
      const db = requireSupabase().from('journal_entries');
      const query = id ? db.update(fields).eq('id', id) : db.insert(fields);
      const { data, error } = await query.select(ENTRY_COLUMNS).single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_entry, draft) => {
      void queryClient.invalidateQueries({ queryKey: journalKeys.all });
      // New entries count as activity (XP, streak, quest); edits do not.
      if (!draft.id) refreshGamification(queryClient);
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase().from('journal_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: journalKeys.all }),
  });
}
