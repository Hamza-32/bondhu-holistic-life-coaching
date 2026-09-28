import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake } from '@/test/fakeSupabase';
import { createWrapper } from '@/test/queryWrapper';
import { useDeleteMood, useLogMood, useMoodEntries } from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

beforeEach(() => fake.reset());

describe('mood data', () => {
  it('loads the last N days, newest first', async () => {
    fake.on('GET', 'mood_entries', { body: [{ id: 'm1', score: 4 }] });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMoodEntries(7), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    const [request] = fake.to('mood_entries');
    const since = Date.parse((request?.params.get('created_at') ?? '').replace('gte.', ''));
    expect(Date.now() - since).toBeGreaterThan(6.9 * 86_400_000);
    expect(Date.now() - since).toBeLessThan(7.1 * 86_400_000);
    expect(request?.params.get('order')).toBe('created_at.desc');
  });

  it('logs a check-in and refreshes moods and gamification', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useLogMood(), { wrapper: Wrapper });
    await result.current.mutateAsync({ score: 5, emotion_tags: ['happy'], note: null });
    expect(fake.to('mood_entries', 'POST')[0]?.body).toEqual({
      score: 5,
      emotion_tags: ['happy'],
      note: null,
    });
    const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
    expect(keys).toEqual(expect.arrayContaining([['mood'], ['profile'], ['quests']]));
  });

  it('deletes by id', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteMood(), { wrapper: Wrapper });
    await result.current.mutateAsync('m1');
    expect(fake.to('mood_entries', 'DELETE')[0]?.params.get('id')).toBe('eq.m1');
  });
});
