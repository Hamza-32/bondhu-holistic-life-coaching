import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { Functions } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { profileKeys } from '@/features/profile/api';

export type Quest = Functions<'get_my_quests'>['Returns'][number];

export const questKeys = { all: ['quests'] as const };

/**
 * XP, level, streak and quests are computed by database triggers when activity is recorded.
 * Call this after any activity mutation so the UI picks up the new values.
 */
export function refreshGamification(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: profileKeys.all });
  void queryClient.invalidateQueries({ queryKey: questKeys.all });
}

export function useMyQuests() {
  return useQuery({
    queryKey: questKeys.all,
    queryFn: async (): Promise<Quest[]> => {
      const { data, error } = await requireSupabase().rpc('get_my_quests');
      if (error) throw error;
      return data;
    },
  });
}

/** Complete a manual quest (e.g. "read an article"). Optimistically ticks it off. */
export function useCompleteQuest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      const { error } = await requireSupabase().rpc('complete_quest', { p_code: code });
      if (error) throw error;
    },
    onMutate: async (code) => {
      await queryClient.cancelQueries({ queryKey: questKeys.all });
      const previous = queryClient.getQueryData<Quest[]>(questKeys.all);
      queryClient.setQueryData<Quest[]>(questKeys.all, (quests) =>
        quests?.map((q) => (q.code === code ? { ...q, completed: true } : q)),
      );
      return { previous };
    },
    onError: (_error, _code, context) => {
      if (context?.previous) queryClient.setQueryData(questKeys.all, context.previous);
    },
    onSettled: () => refreshGamification(queryClient),
  });
}
