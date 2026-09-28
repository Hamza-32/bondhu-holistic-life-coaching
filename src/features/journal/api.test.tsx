import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake } from '@/test/fakeSupabase';
import { createWrapper } from '@/test/queryWrapper';
import {
  useDeleteJournalEntry,
  useJournalEntries,
  useJournalPrompts,
  useSaveJournalEntry,
} from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

const entry = { id: 'j1', title: null, body: 'hello', prompt_id: null, mood_score: 3 };

beforeEach(() => fake.reset());

describe('journal data', () => {
  it('loads up to 100 entries newest first, and the prompts', async () => {
    fake.on('GET', 'journal_entries', { body: [entry] });
    fake.on('GET', 'journal_prompts', { body: [{ id: 'p1', text_en: 'Hi', text_bn: 'হাই' }] });
    const { Wrapper } = createWrapper();
    const entries = renderHook(() => useJournalEntries(), { wrapper: Wrapper });
    const prompts = renderHook(() => useJournalPrompts(), { wrapper: Wrapper });
    await waitFor(() => expect(entries.result.current.data).toHaveLength(1));
    await waitFor(() => expect(prompts.result.current.data).toHaveLength(1));
    const [request] = fake.to('journal_entries');
    expect(request?.params.get('limit')).toBe('100');
    expect(request?.params.get('order')).toBe('created_at.desc');
  });

  it('inserts new entries (counting as activity) and updates existing ones (not)', async () => {
    fake.on('POST', 'journal_entries', { status: 201, body: entry });
    fake.on('PATCH', 'journal_entries', { body: entry });
    const { Wrapper, queryClient } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveJournalEntry(), { wrapper: Wrapper });

    await result.current.mutateAsync({
      title: null,
      body: 'hello',
      prompt_id: null,
      mood_score: 3,
    });
    expect(fake.to('journal_entries', 'POST')).toHaveLength(1);
    expect(invalidate.mock.calls.some(([f]) => f?.queryKey?.[0] === 'profile')).toBe(true);

    invalidate.mockClear();
    await result.current.mutateAsync({
      id: 'j1',
      title: 'Edited',
      body: 'hello',
      prompt_id: null,
      mood_score: 3,
    });
    const [patch] = fake.to('journal_entries', 'PATCH');
    expect(patch?.params.get('id')).toBe('eq.j1');
    expect(patch?.body).not.toHaveProperty('id');
    expect(invalidate.mock.calls.some(([f]) => f?.queryKey?.[0] === 'profile')).toBe(false);
  });

  it('deletes by id', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useDeleteJournalEntry(), { wrapper: Wrapper });
    await result.current.mutateAsync('j1');
    expect(fake.to('journal_entries', 'DELETE')[0]?.params.get('id')).toBe('eq.j1');
  });
});
