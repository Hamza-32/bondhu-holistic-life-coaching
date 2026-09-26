import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Tables } from '@/lib/database.types';
import { requireSupabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type Mentor = Tables<'mentors'> & {
  mentor_slots: Pick<Tables<'mentor_slots'>, 'id' | 'starts_at' | 'ends_at'>[];
};
export type Practitioner = Tables<'practitioners'>;
export type Booking = Pick<Tables<'bookings'>, 'id' | 'status' | 'notes' | 'created_at'> & {
  mentor: Pick<Tables<'mentors'>, 'name' | 'avatar_seed'> | null;
  slot: Pick<Tables<'mentor_slots'>, 'starts_at' | 'ends_at'> | null;
};

export const coachingKeys = {
  mentors: ['coaching', 'mentors'] as const,
  bookings: ['coaching', 'bookings'] as const,
  practitioners: ['coaching', 'practitioners'] as const,
};

/** Fictional demo mentors with their open future slots (next 3 weeks). */
export function useMentors() {
  return useQuery({
    queryKey: coachingKeys.mentors,
    queryFn: async (): Promise<Mentor[]> => {
      const { data, error } = await requireSupabase()
        .from('mentors')
        .select('*, mentor_slots(id, starts_at, ends_at)')
        .eq('mentor_slots.is_booked', false)
        .gt('mentor_slots.starts_at', new Date().toISOString())
        .order('name')
        .order('starts_at', { referencedTable: 'mentor_slots' });
      if (error) throw error;
      return data;
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: coachingKeys.bookings,
    queryFn: async (): Promise<Booking[]> => {
      const { data, error } = await requireSupabase()
        .from('bookings')
        .select(
          'id, status, notes, created_at, mentor:mentors(name, avatar_seed), slot:mentor_slots(starts_at, ends_at)',
        )
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });
}

/** Real professionals' public listings. Booking happens on their own official websites. */
export function usePractitioners() {
  return useQuery({
    queryKey: coachingKeys.practitioners,
    queryFn: async (): Promise<Practitioner[]> => {
      const { data, error } = await requireSupabase()
        .from('practitioners')
        .select('*')
        .order('division_slug')
        .order('full_name');
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60_000,
  });
}

export type BookingErrorKey =
  | 'coaching.errors.slotUnavailable'
  | 'coaching.errors.slotInPast'
  | 'coaching.errors.tooMany'
  | 'common.saveFailed';

/** Map book_slot() exceptions to translated messages. */
export function bookingErrorKey(error: unknown): BookingErrorKey {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String(error.message)
        : '';
  if (message.includes('slot_unavailable') || message.includes('bookings_one_active_per_slot'))
    return 'coaching.errors.slotUnavailable';
  if (message.includes('slot_in_past')) return 'coaching.errors.slotInPast';
  if (message.includes('too_many_bookings')) return 'coaching.errors.tooMany';
  return 'common.saveFailed';
}

export function useBookSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ slotId, notes }: { slotId: string; notes: string | null }) => {
      const { error } = await requireSupabase().rpc('book_slot', {
        p_slot_id: slotId,
        ...(notes ? { p_notes: notes } : {}),
      });
      if (error) throw error;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: coachingKeys.mentors });
      void queryClient.invalidateQueries({ queryKey: coachingKeys.bookings });
    },
    onSuccess: () => refreshGamification(queryClient),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await requireSupabase().rpc('cancel_booking', { p_booking_id: bookingId });
      if (error) throw error;
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: coachingKeys.mentors });
      void queryClient.invalidateQueries({ queryKey: coachingKeys.bookings });
    },
  });
}
