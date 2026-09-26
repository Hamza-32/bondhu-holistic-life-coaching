import { useMutation, useQueryClient } from '@tanstack/react-query';
import { requireSupabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type GameCode =
  'shapla_breath' | 'rickshaw_memory' | 'nouka_drift' | 'shobdo' | 'kantha_canvas' | 'bubble_pop';

/**
 * Record a finished game session. XP (with a per-day cap) and the breathing quest are awarded
 * by database triggers, so scores here cannot inflate XP.
 */
export function useRecordGame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (game: { game_code: GameCode; score: number; duration_seconds: number }) => {
      const { error } = await requireSupabase()
        .from('game_scores')
        .insert({
          ...game,
          score: Math.max(0, Math.round(game.score)),
          duration_seconds: Math.max(0, Math.round(game.duration_seconds)),
        });
      if (error) throw error;
    },
    onSuccess: () => refreshGamification(queryClient),
  });
}
