import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';

export type Division = Tables<'divisions'>;
export type University = Pick<
  Tables<'universities'>,
  'id' | 'name_en' | 'name_bn' | 'type' | 'division_slug'
>;

/** Reference data rarely changes; cache it for the whole session. */
const REFERENCE_STALE_TIME = Infinity;

export function useDivisions() {
  return useQuery({
    queryKey: ['reference', 'divisions'],
    queryFn: async (): Promise<Division[]> => {
      const { data, error } = await requireSupabase()
        .from('divisions')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    staleTime: REFERENCE_STALE_TIME,
  });
}

export function useUniversities() {
  return useQuery({
    queryKey: ['reference', 'universities'],
    queryFn: async (): Promise<University[]> => {
      const { data, error } = await requireSupabase()
        .from('universities')
        .select('id, name_en, name_bn, type, division_slug')
        .order('name_en');
      if (error) throw error;
      return data;
    },
    staleTime: REFERENCE_STALE_TIME,
  });
}
