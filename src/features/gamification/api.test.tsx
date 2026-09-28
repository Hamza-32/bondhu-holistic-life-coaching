import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake, pgError } from '@/test/fakeSupabase';
import { createWrapper } from '@/test/queryWrapper';
import { questKeys, useCompleteQuest, useMyQuests, type Quest } from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

const quests = [
  { id: 'q1', code: 'read_article', completed: false, xp_reward: 30 },
  { id: 'q2', code: 'morning_checkin', completed: true, xp_reward: 50 },
] as unknown as Quest[];

beforeEach(() => fake.reset());

describe('quests', () => {
  it('loads today’s quests from the RPC', async () => {
    fake.on('POST', 'rpc/get_my_quests', { body: quests });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useMyQuests(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(2));
  });

  it('ticks a manual quest off optimistically and refreshes XP afterwards', async () => {
    let release: () => void = () => undefined;
    fake.on('POST', 'rpc/complete_quest', () => ({ body: null }));
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(questKeys.all, quests);
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useCompleteQuest(), { wrapper: Wrapper });

    const done = new Promise<void>((resolve) => (release = resolve));
    result.current.mutate('read_article', { onSettled: () => release() });
    await waitFor(() =>
      expect(queryClient.getQueryData<Quest[]>(questKeys.all)?.[0]?.completed).toBe(true),
    );
    await done;
    expect(fake.to('rpc/complete_quest')[0]?.body).toEqual({ p_code: 'read_article' });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['profile'] });
  });

  it('rolls the optimistic tick back when the server refuses', async () => {
    fake.on('POST', 'rpc/complete_quest', pgError('quest_already_completed'));
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(questKeys.all, quests);
    const { result } = renderHook(() => useCompleteQuest(), { wrapper: Wrapper });
    await expect(result.current.mutateAsync('read_article')).rejects.toBeTruthy();
    expect(queryClient.getQueryData<Quest[]>(questKeys.all)?.[0]?.completed).toBe(false);
  });
});
