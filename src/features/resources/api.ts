import { useQuery } from '@tanstack/react-query';
import type { Tables } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';

export type Helpline = Tables<'helplines'>;
export type SupportOrganization = Tables<'support_organizations'>;
export type Resource = Tables<'resources'>;

/** Verified safety data changes rarely; cache for the session. */
const SAFETY_STALE_TIME = 30 * 60_000;

export function useHelplines() {
  return useQuery({
    queryKey: ['resources', 'helplines'],
    queryFn: async (): Promise<Helpline[]> => {
      const { data, error } = await requireSupabase()
        .from('helplines')
        .select('*')
        .order('sort_order')
        .order('name');
      if (error) throw error;
      return data;
    },
    staleTime: SAFETY_STALE_TIME,
  });
}

export function useSupportOrganizations() {
  return useQuery({
    queryKey: ['resources', 'organizations'],
    queryFn: async (): Promise<SupportOrganization[]> => {
      const { data, error } = await requireSupabase()
        .from('support_organizations')
        .select('*')
        .order('kind')
        .order('name_en');
      if (error) throw error;
      return data;
    },
    staleTime: SAFETY_STALE_TIME,
  });
}

export function useResources() {
  return useQuery({
    queryKey: ['resources', 'links'],
    queryFn: async (): Promise<Resource[]> => {
      const { data, error } = await requireSupabase()
        .from('resources')
        .select('*')
        .order('category')
        .order('title_en');
      if (error) throw error;
      return data;
    },
    staleTime: SAFETY_STALE_TIME,
  });
}

/** tel: link for a published number (digits and a leading + only). */
export function telHref(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`;
}
