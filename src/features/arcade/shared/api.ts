import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Functions } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type GameCode =
  'shapla_breath' | 'rickshaw_memory' | 'nouka_drift' | 'shobdo' | 'kantha_canvas' | 'bubble_pop';

export type LeaderboardMode = 'best' | 'total';
export type LeaderboardRow = Functions<'get_leaderboard'>['Returns'][number];

export const arcadeKeys = {
  leaderboard: (game: GameCode, mode: LeaderboardMode) =>
    ['arcade', 'leaderboard', game, mode] as const,
};

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
          score: Math.min(1_000_000, Math.max(0, Math.round(game.score))),
          duration_seconds: Math.min(86_400, Math.max(0, Math.round(game.duration_seconds))),
        });
      if (error) throw error;
    },
    onSuccess: (_d, game) => {
      refreshGamification(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['arcade', 'leaderboard', game.game_code] });
    },
  });
}

/** Top players (anonymous aliases only) plus the current player's own rank. */
export function useLeaderboard(game: GameCode, mode: LeaderboardMode) {
  return useQuery({
    queryKey: arcadeKeys.leaderboard(game, mode),
    queryFn: async (): Promise<LeaderboardRow[]> => {
      const { data, error } = await requireSupabase().rpc('get_leaderboard', {
        p_game_code: game,
        p_mode: mode,
        p_limit: 10,
      });
      if (error) throw error;
      return data;
    },
  });
}
