import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake, pgError } from '@/test/fakeSupabase';
import { createWrapper, TEST_USER_ID } from '@/test/queryWrapper';
import { profileKeys, useProfile, useUpdateProfile } from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

const profile = { id: TEST_USER_ID, display_name: 'Nadia', xp: 10, level: 1 };

beforeEach(() => fake.reset());

describe('useProfile', () => {
  it("loads only the signed-in user's row as a single object", async () => {
    fake.on('GET', 'profiles', { body: profile });
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.data).toEqual(profile));
    const [request] = fake.to('profiles');
    expect(request?.params.get('id')).toBe(`eq.${TEST_USER_ID}`);
    expect(request?.headers.get('accept')).toContain('vnd.pgrst.object');
  });

  it('does not query while signed out', () => {
    const { Wrapper } = createWrapper({
      auth: { status: 'signedOut', session: null, user: null },
    });
    const { result } = renderHook(() => useProfile(), { wrapper: Wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(fake.requests).toHaveLength(0);
  });

  it('surfaces database errors', async () => {
    fake.on('GET', 'profiles', pgError('boom'));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useProfile(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateProfile', () => {
  it('patches allowed fields for the current user and updates the cache', async () => {
    fake.on('PATCH', 'profiles', { body: { ...profile, display_name: 'Nadia R' } });
    const { Wrapper, queryClient } = createWrapper();
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });
    await result.current.mutateAsync({ display_name: 'Nadia R' });
    const [request] = fake.to('profiles', 'PATCH');
    expect(request?.body).toEqual({ display_name: 'Nadia R' });
    expect(request?.params.get('id')).toBe(`eq.${TEST_USER_ID}`);
    expect(queryClient.getQueryData(profileKeys.detail(TEST_USER_ID))).toMatchObject({
      display_name: 'Nadia R',
    });
  });

  it('refuses to run without a session', async () => {
    const { Wrapper } = createWrapper({
      auth: { status: 'signedOut', session: null, user: null },
    });
    const { result } = renderHook(() => useUpdateProfile(), { wrapper: Wrapper });
    await expect(result.current.mutateAsync({ display_name: 'x' })).rejects.toThrow(
      'not_authenticated',
    );
    expect(fake.requests).toHaveLength(0);
  });
});
