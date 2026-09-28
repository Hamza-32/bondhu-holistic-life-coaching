import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake, pgError } from '@/test/fakeSupabase';
import { createWrapper } from '@/test/queryWrapper';
import {
  bookingErrorKey,
  useBookSlot,
  useCancelBooking,
  useMentors,
  useMyBookings,
  usePractitioners,
} from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

beforeEach(() => fake.reset());

describe('coaching reads', () => {
  it('loads mentors with only open future slots', async () => {
    fake.on('GET', 'mentors', { body: [{ id: 'm1', name: 'A', mentor_slots: [] }] });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMentors(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    const [request] = fake.to('mentors');
    expect(request?.params.get('mentor_slots.is_booked')).toBe('eq.false');
    expect(request?.params.get('mentor_slots.starts_at')).toMatch(/^gt\./);
  });

  it('loads bookings and practitioners', async () => {
    fake.on('GET', 'bookings', { body: [{ id: 'b1' }] });
    fake.on('GET', 'practitioners', { body: [{ id: 'p1' }] });
    const { Wrapper } = createWrapper();
    const bookings = renderHook(() => useMyBookings(), { wrapper: Wrapper });
    const practitioners = renderHook(() => usePractitioners(), { wrapper: Wrapper });
    await waitFor(() => expect(bookings.result.current.data).toHaveLength(1));
    await waitFor(() => expect(practitioners.result.current.data).toHaveLength(1));
    expect(fake.to('bookings')[0]?.params.get('select')).toContain('mentor:mentors');
  });
});

describe('booking', () => {
  it('books through the RPC, sending notes only when given', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBookSlot(), { wrapper: Wrapper });
    await result.current.mutateAsync({ slotId: 's1', notes: null });
    await result.current.mutateAsync({ slotId: 's2', notes: 'Exam stress' });
    const calls = fake.to('rpc/book_slot').map((r) => r.body);
    expect(calls).toEqual([{ p_slot_id: 's1' }, { p_slot_id: 's2', p_notes: 'Exam stress' }]);
  });

  it('cancels through the RPC', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useCancelBooking(), { wrapper: Wrapper });
    await result.current.mutateAsync('b1');
    expect(fake.to('rpc/cancel_booking')[0]?.body).toEqual({ p_booking_id: 'b1' });
  });

  it('maps database errors to friendly messages', async () => {
    fake.on('POST', 'rpc/book_slot', pgError('slot_unavailable'));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useBookSlot(), { wrapper: Wrapper });
    const error: unknown = await result.current
      .mutateAsync({ slotId: 's1', notes: null })
      .catch((e: unknown) => e);
    expect(bookingErrorKey(error)).toBe('coaching.errors.slotUnavailable');
    expect(bookingErrorKey(new Error('slot_in_past'))).toBe('coaching.errors.slotInPast');
    expect(bookingErrorKey({ message: 'too_many_bookings' })).toBe('coaching.errors.tooMany');
    expect(bookingErrorKey('weird')).toBe('common.saveFailed');
  });
});
