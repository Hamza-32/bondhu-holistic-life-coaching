import type { QueryClient } from '@tanstack/react-query';
import { profileKeys } from '@/features/profile/api';
import { requireSupabase } from '@/lib/supabase';

/**
 * Demo mode: sign in as an anonymous Supabase user and fill that private sandbox with sample
 * data (`start_demo`). No shared account or password exists; sandboxes are purged after two days.
 */
export async function startDemo(queryClient: QueryClient) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  const { error: rpcError } = await supabase.rpc('start_demo');
  if (rpcError) {
    await supabase.auth.signOut({ scope: 'local' });
    throw rpcError;
  }
  if (data.user)
    await queryClient.invalidateQueries({ queryKey: profileKeys.detail(data.user.id) });
}
