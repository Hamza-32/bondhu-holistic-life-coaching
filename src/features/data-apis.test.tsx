/**
 * Data-layer tests for the smaller feature APIs (reference data, resources, toolkit, arcade,
 * account, demo) against a faked Supabase transport.
 */
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake, pgError } from '@/test/fakeSupabase';
import { createWrapper, TEST_USER_ID } from '@/test/queryWrapper';
import { useDeleteAccount, useExportData } from './account/api';
import { useLeaderboard, useRecordGame } from './arcade/shared/api';
import { startDemo } from './demo/api';
import { useDivisions, useUniversities } from './reference/api';
import { telHref, useHelplines, useResources, useSupportOrganizations } from './resources/api';
import { toolkitKeys, useResume, useSaveQuizResult, useSaveResume } from './toolkit/api';
import { EMPTY_RESUME } from './toolkit/resume/schema';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

beforeEach(() => fake.reset());

describe('reference and safety data', () => {
  it('reads divisions, universities, helplines, organisations and resources in order', async () => {
    for (const table of [
      'divisions',
      'universities',
      'helplines',
      'support_organizations',
      'resources',
    ])
      fake.on('GET', table, { body: [{ id: table }] });
    const { Wrapper } = createWrapper();
    const hooks = [
      useDivisions,
      useUniversities,
      useHelplines,
      useSupportOrganizations,
      useResources,
    ];
    for (const hook of hooks) {
      const { result } = renderHook(() => hook(), { wrapper: Wrapper });
      await waitFor(() => expect(result.current.data).toHaveLength(1));
    }
    expect(fake.to('divisions')[0]?.params.get('order')).toBe('sort_order.asc');
    // supabase-js combines chained order clauses into one PostgREST `order` parameter.
    expect(fake.to('helplines')[0]?.params.get('order')).toBe('sort_order.asc,name.asc');
  });

  it('builds tel: links from published numbers', () => {
    expect(telHref('999')).toBe('tel:999');
    expect(telHref('+880 1776-632344')).toBe('tel:+8801776632344');
  });
});

describe('toolkit', () => {
  it('returns an empty resume when none is saved yet', async () => {
    fake.on('GET', 'resumes', { status: 406, body: { code: 'PGRST116', message: 'no rows' } });
    fake.on('GET', 'resumes', { body: null });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useResume(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ id: null, data: EMPTY_RESUME, updatedAt: null });
  });

  it('inserts the first resume, then updates it, caching the saved copy', async () => {
    const row = { id: 'r1', data: EMPTY_RESUME, updated_at: '2026-09-26T00:00:00Z' };
    fake.on('POST', 'resumes', { status: 201, body: row });
    fake.on('PATCH', 'resumes', { body: row });
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useSaveResume(), { wrapper: Wrapper });
    await result.current.mutateAsync({ id: null, data: EMPTY_RESUME });
    await result.current.mutateAsync({ id: 'r1', data: EMPTY_RESUME });
    expect(fake.to('resumes', 'POST')).toHaveLength(1);
    expect(fake.to('resumes', 'PATCH')[0]?.params.get('id')).toBe('eq.r1');
    expect(queryClient.getQueryData(toolkitKeys.resume)).toMatchObject({ id: 'r1' });
  });

  it('stores quiz results', async () => {
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useSaveQuizResult(), { wrapper: Wrapper });
    await result.current.mutateAsync({ archetype: 'tech', answers: ['tech', 'social'] });
    expect(fake.to('quiz_results', 'POST')[0]?.body).toEqual({
      answers: { archetype: 'tech', answers: ['tech', 'social'] },
      result_career_ids: [],
    });
  });
});

describe('arcade', () => {
  it('clamps scores before saving and refreshes the leaderboard', async () => {
    const { Wrapper, queryClient } = createWrapper();
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRecordGame(), { wrapper: Wrapper });
    await result.current.mutateAsync({
      game_code: 'nouka_drift',
      score: 2_000_000.6,
      duration_seconds: -5,
    });
    expect(fake.to('game_scores', 'POST')[0]?.body).toEqual({
      game_code: 'nouka_drift',
      score: 1_000_000,
      duration_seconds: 0,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['arcade', 'leaderboard', 'nouka_drift'] });
  });

  it('asks the leaderboard RPC for the top 10 in the chosen mode', async () => {
    fake.on('POST', 'rpc/get_leaderboard', {
      body: [{ rank: 1, alias: 'A', score: 3, is_me: true }],
    });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useLeaderboard('shobdo', 'total'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(fake.to('rpc/get_leaderboard')[0]?.body).toEqual({
      p_game_code: 'shobdo',
      p_mode: 'total',
      p_limit: 10,
    });
  });
});

describe('account', () => {
  it('downloads the export as a dated JSON file', async () => {
    fake.on('POST', 'rpc/export_my_data', { body: { format: 'bondhu-export-v1' } });
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useExportData(), { wrapper: Wrapper });
    await result.current.mutateAsync();
    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.contexts[0] as HTMLAnchorElement;
    expect(anchor.download).toMatch(/^bondhu-data-\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('deletes the account, ends the local session and clears cached data', async () => {
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(['profile', TEST_USER_ID], { id: TEST_USER_ID });
    const { result } = renderHook(() => useDeleteAccount(), { wrapper: Wrapper });
    await result.current.mutateAsync();
    expect(fake.to('rpc/delete_my_account')).toHaveLength(1);
    await waitFor(() =>
      expect(queryClient.getQueryData(['profile', TEST_USER_ID])).toBeUndefined(),
    );
  });

  it('keeps data when deletion fails', async () => {
    fake.on('POST', 'rpc/delete_my_account', pgError('nope'));
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(['profile', TEST_USER_ID], { id: TEST_USER_ID });
    const { result } = renderHook(() => useDeleteAccount(), { wrapper: Wrapper });
    await expect(result.current.mutateAsync()).rejects.toBeTruthy();
    expect(queryClient.getQueryData(['profile', TEST_USER_ID])).toBeDefined();
  });
});

describe('demo mode', () => {
  const session = {
    access_token: 'token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'refresh',
    user: {
      id: 'guest',
      aud: 'authenticated',
      is_anonymous: true,
      app_metadata: {},
      user_metadata: {},
    },
  };

  it('signs in anonymously, then fills the sandbox', async () => {
    fake.on('POST', 'auth/signup', { body: session });
    const { queryClient } = createWrapper();
    await startDemo(queryClient);
    expect(fake.requests.map((r) => r.path)).toEqual(['auth/signup', 'rpc/start_demo']);
  });

  it('signs back out if the sandbox cannot be created', async () => {
    fake.on('POST', 'auth/signup', { body: session });
    fake.on('POST', 'rpc/start_demo', pgError('demo_requires_anonymous_user'));
    const { queryClient } = createWrapper();
    await expect(startDemo(queryClient)).rejects.toBeTruthy();
    expect(fake.to('auth/logout')).toHaveLength(1);
  });
});
