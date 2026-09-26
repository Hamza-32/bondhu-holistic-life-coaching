import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tables } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type MoodEntry = Pick<
  Tables<'mood_entries'>,
  'id' | 'score' | 'emotion_tags' | 'note' | 'created_at'
>;

export const EMOTIONS = [
  'happy',
  'calm',
  'grateful',
  'hopeful',
  'motivated',
  'tired',
  'anxious',
  'stressed',
  'overwhelmed',
  'sad',
  'lonely',
  'angry',
] as const;
export type Emotion = (typeof EMOTIONS)[number];

export const moodKeys = {
  all: ['mood'] as const,
  range: (days: number) => ['mood', days] as const,
};

export function useMoodEntries(days: number) {
  return useQuery({
    queryKey: moodKeys.range(days),
    queryFn: async (): Promise<MoodEntry[]> => {
      const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
      const { data, error } = await requireSupabase()
        .from('mood_entries')
        .select('id, score, emotion_tags, note, created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export interface NewMood {
  score: number;
  emotion_tags: Emotion[];
  note: string | null;
}

export function useLogMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mood: NewMood) => {
      const { error } = await requireSupabase().from('mood_entries').insert(mood);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: moodKeys.all });
      refreshGamification(queryClient);
    },
  });
}

export function useDeleteMood() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await requireSupabase().from('mood_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: moodKeys.all }),
  });
}
