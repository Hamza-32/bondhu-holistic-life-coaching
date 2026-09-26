import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Json } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { parseStoredResume, type Resume } from './resume/schema';

export const toolkitKeys = {
  resume: ['toolkit', 'resume'] as const,
  quiz: ['toolkit', 'quiz'] as const,
};

export interface StoredResume {
  id: string | null;
  data: Resume;
  updatedAt: string | null;
}

/** The user's resume (one per user in this version). */
export function useResume() {
  return useQuery({
    queryKey: toolkitKeys.resume,
    queryFn: async (): Promise<StoredResume> => {
      const { data, error } = await requireSupabase()
        .from('resumes')
        .select('id, data, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return {
        id: data?.id ?? null,
        data: parseStoredResume(data?.data),
        updatedAt: data?.updated_at ?? null,
      };
    },
  });
}

export function useSaveResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | null;
      data: Resume;
    }): Promise<StoredResume> => {
      const payload = { data: data as unknown as Json };
      const table = requireSupabase().from('resumes');
      const query = id ? table.update(payload).eq('id', id) : table.insert(payload);
      const { data: row, error } = await query.select('id, data, updated_at').single();
      if (error) throw error;
      return { id: row.id, data: parseStoredResume(row.data), updatedAt: row.updated_at };
    },
    onSuccess: (saved) => queryClient.setQueryData(toolkitKeys.resume, saved),
  });
}

export type Archetype = 'tech' | 'social' | 'creative' | 'business';

export function useSaveQuizResult() {
  return useMutation({
    mutationFn: async ({ archetype, answers }: { archetype: Archetype; answers: Archetype[] }) => {
      // Career-path matching arrives with verified Bangladeshi career data; for now the
      // archetype and raw answers are stored.
      const { error } = await requireSupabase()
        .from('quiz_results')
        .insert({ answers: { archetype, answers } as unknown as Json, result_career_ids: [] });
      if (error) throw error;
    },
  });
}
