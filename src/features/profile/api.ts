import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tables, TablesUpdate } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/context';

export type Profile = Tables<'profiles'>;

/** Fields the client is allowed to change (the database enforces this with column grants). */
export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  | 'display_name'
  | 'anonymous_alias'
  | 'avatar_seed'
  | 'division'
  | 'university_id'
  | 'locale'
  | 'goals'
  | 'onboarding_done'
>;

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => ['profile', userId] as const,
};

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await requireSupabase()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

/** The signed-in user's profile. */
export function useProfile() {
  const { state } = useAuth();
  const userId = state.status === 'signedIn' ? state.user.id : null;

  return useQuery({
    queryKey: profileKeys.detail(userId ?? 'anonymous'),
    queryFn: () => fetchProfile(userId ?? ''),
    enabled: userId !== null,
    staleTime: 60_000,
  });
}

export function useUpdateProfile() {
  const { state } = useAuth();
  const queryClient = useQueryClient();
  const userId = state.status === 'signedIn' ? state.user.id : null;

  return useMutation({
    mutationFn: async (changes: ProfileUpdate) => {
      if (!userId) throw new Error('not_authenticated');
      const { data, error } = await requireSupabase()
        .from('profiles')
        .update(changes)
        .eq('id', userId)
        .select('*')
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(profileKeys.detail(profile.id), profile);
    },
  });
}
