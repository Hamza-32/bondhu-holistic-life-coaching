import type { InfiniteData } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fake, pgError } from '@/test/fakeSupabase';
import { createWrapper } from '@/test/queryWrapper';
import {
  communityErrorKey,
  communityKeys,
  useAddComment,
  useComments,
  useCreatePost,
  useDeletePost,
  useFeed,
  useReport,
  useToggleLike,
  type FeedPost,
} from './api';

vi.mock('@/lib/supabase', () => import('@/test/fakeSupabase').then((m) => m.supabaseModule));

function post(i: number, extra: Partial<FeedPost> = {}): FeedPost {
  return {
    id: `p${i}`,
    body: `post ${i}`,
    created_at: new Date(Date.UTC(2026, 8, 26, 12, 0, 0) - i * 60_000).toISOString(),
    like_count: 2,
    comment_count: 0,
    liked_by_me: false,
    ...extra,
  } as FeedPost;
}

beforeEach(() => fake.reset());

describe('feed', () => {
  it('pages with a created_at cursor and filters by tag', async () => {
    const page1 = Array.from({ length: 15 }, (_, i) => post(i));
    fake.on('POST', 'rpc/get_feed', (req) =>
      (req.body as { p_before?: string }).p_before ? { body: [post(99)] } : { body: page1 },
    );
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useFeed('exams'), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.hasNextPage).toBe(true));
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
    const bodies = fake.to('rpc/get_feed').map((r) => r.body);
    expect(bodies[0]).toEqual({ p_limit: 15, p_tag: 'exams' });
    expect(bodies[1]).toEqual({ p_limit: 15, p_tag: 'exams', p_before: page1[14]?.created_at });
    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('likes', () => {
  function seed(queryClient: ReturnType<typeof createWrapper>['queryClient']) {
    queryClient.setQueryData<InfiniteData<FeedPost[], string | null>>(communityKeys.feed(null), {
      pages: [[post(1)]],
      pageParams: [null],
    });
  }
  const first = (queryClient: ReturnType<typeof createWrapper>['queryClient']) =>
    queryClient.getQueryData<InfiniteData<FeedPost[]>>(communityKeys.feed(null))?.pages[0]?.[0];

  it('updates the count instantly and sends a like', async () => {
    const { Wrapper, queryClient } = createWrapper();
    seed(queryClient);
    const { result } = renderHook(() => useToggleLike(), { wrapper: Wrapper });
    await result.current.mutateAsync({ postId: 'p1', liked: false });
    expect(first(queryClient)).toMatchObject({ like_count: 3, liked_by_me: true });
    expect(fake.to('post_likes', 'POST')[0]?.body).toEqual({ post_id: 'p1' });
  });

  it('rolls back when the server fails', async () => {
    fake.on('POST', 'post_likes', pgError('nope'));
    const { Wrapper, queryClient } = createWrapper();
    seed(queryClient);
    const { result } = renderHook(() => useToggleLike(), { wrapper: Wrapper });
    await expect(result.current.mutateAsync({ postId: 'p1', liked: false })).rejects.toBeTruthy();
    expect(first(queryClient)).toMatchObject({ like_count: 2, liked_by_me: false });
  });

  it('unlikes with a delete', async () => {
    const { Wrapper, queryClient } = createWrapper();
    seed(queryClient);
    const { result } = renderHook(() => useToggleLike(), { wrapper: Wrapper });
    await result.current.mutateAsync({ postId: 'p1', liked: true });
    expect(fake.to('post_likes', 'DELETE')[0]?.params.get('post_id')).toBe('eq.p1');
  });
});

describe('posts, comments and reports', () => {
  it('creates and deletes posts', async () => {
    const { Wrapper } = createWrapper();
    const create = renderHook(() => useCreatePost(), { wrapper: Wrapper });
    await create.result.current.mutateAsync({ body: 'hi', tags: ['exams'], is_anonymous: true });
    expect(fake.to('posts', 'POST')[0]?.body).toEqual({
      body: 'hi',
      tags: ['exams'],
      is_anonymous: true,
    });
    const remove = renderHook(() => useDeletePost(), { wrapper: Wrapper });
    await remove.result.current.mutateAsync('p1');
    expect(fake.to('posts', 'DELETE')[0]?.params.get('id')).toBe('eq.p1');
  });

  it('loads comments only when enabled, and adds anonymous comments', async () => {
    fake.on('POST', 'rpc/get_comments', { body: [{ id: 'c1' }] });
    const { Wrapper, queryClient } = createWrapper();
    queryClient.setQueryData(communityKeys.feed(null), { pages: [[post(1)]], pageParams: [null] });
    const closed = renderHook(() => useComments('p1', false), { wrapper: Wrapper });
    expect(closed.result.current.fetchStatus).toBe('idle');
    const open = renderHook(() => useComments('p1', true), { wrapper: Wrapper });
    await waitFor(() => expect(open.result.current.data).toHaveLength(1));

    const add = renderHook(() => useAddComment('p1'), { wrapper: Wrapper });
    await add.result.current.mutateAsync('Same here');
    expect(fake.to('comments', 'POST')[0]?.body).toEqual({
      post_id: 'p1',
      body: 'Same here',
      is_anonymous: true,
    });
    const data = queryClient.getQueryData<InfiniteData<FeedPost[]>>(communityKeys.feed(null));
    expect(data?.pages[0]?.[0]?.comment_count).toBe(1);
  });

  it('treats a duplicate report as success', async () => {
    fake.on('POST', 'reports', pgError('duplicate key', '23505'));
    const { Wrapper } = createWrapper();
    const { result } = renderHook(() => useReport(), { wrapper: Wrapper });
    await expect(
      result.current.mutateAsync({ post_id: 'p1', reason: 'spam', details: null }),
    ).resolves.toBeUndefined();
  });

  it('maps guard errors to friendly messages', () => {
    expect(communityErrorKey({ message: 'blocked_language' })).toBe(
      'community.errors.blockedLanguage',
    );
    expect(communityErrorKey(new Error('demo_read_only'))).toBe('community.errors.demoReadOnly');
    expect(communityErrorKey(null)).toBe('common.saveFailed');
  });
});
