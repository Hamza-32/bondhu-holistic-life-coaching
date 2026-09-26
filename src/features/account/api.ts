import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dhakaDateKey } from '@/lib/format';
import { requireSupabase } from '@/lib/supabase';

/** Save a JSON document as a file download. */
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Download everything Bondhu stores about the signed-in user as one JSON file. */
export function useExportData() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await requireSupabase().rpc('export_my_data');
      if (error) throw error;
      downloadJson(data, `bondhu-data-${dhakaDateKey(new Date())}.json`);
    },
  });
}

/** Permanently delete the account and all its data, then end the local session. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const supabase = requireSupabase();
      const { error } = await supabase.rpc('delete_my_account');
      if (error) throw error;
      // The user no longer exists server-side; only clear the local session.
      await supabase.auth.signOut({ scope: 'local' });
    },
    onSuccess: () => queryClient.clear(),
  });
}
