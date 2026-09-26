import { useEffect, useState } from 'react';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import type { Functions } from '@/lib/database.types';
import { requireSupabase, supabase } from '@/lib/supabase';
import { refreshGamification } from '@/features/gamification/api';

export type FeedPost = Functions<'get_feed'>['Returns'][number];
export type Comment = Functions<'get_comments'>['Returns'][number];

export const TAGS = [
  'exams',
  'admission',
  'family',
  'career',
  'stress',
  'sleep',
  'friendship',
  'hostel',
  'traffic',
  'motivation',
] as const;
export type Tag = (typeof TAGS)[number];

export const REPORT_REASONS = [
  'spam',
  'harassment',
  'hate',
  'self_harm',
  'misinformation',
  'other',
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

const PAGE_SIZE = 15;

export const communityKeys = {
  feed: (tag: Tag | null) => ['community', 'feed', tag ?? 'all'] as const,
  feeds: ['community', 'feed'] as const,
  comments: (postId: string) => ['community', 'comments', postId] as const,
};

export function useFeed(tag: Tag | null) {
  return useInfiniteQuery({
    queryKey: communityKeys.feed(tag),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }): Promise<FeedPost[]> => {
      const { data, error } = await requireSupabase().rpc('get_feed', {
        p_limit: PAGE_SIZE,
        ...(pageParam ? { p_before: pageParam } : {}),
        ...(tag ? { p_tag: tag } : {}),
      });
      if (error) throw error;
      return data;
    },
    getNextPageParam: (last) =>
      last.length === PAGE_SIZE ? (last.at(-1)?.created_at ?? null) : null,
  });
}

type FeedData = InfiniteData<FeedPost[], string | null>;

function updatePost(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  update: (p: FeedPost) => FeedPost,
) {
  queryClient.setQueriesData<FeedData>({ queryKey: communityKeys.feeds }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((page) => page.map((p) => (p.id === postId ? update(p) : p))),
        }
      : data,
  );
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (post: { body: string; tags: Tag[]; is_anonymous: boolean }) => {
      const { error } = await requireSupabase().from('posts').insert(post);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.feeds });
      refreshGamification(queryClient);
    },
  });
}

/** Like/unlike with an optimistic update and rollback on failure. */
export function useToggleLike() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const table = requireSupabase().from('post_likes');
      const { error } = liked
        ? await table.delete().eq('post_id', postId)
        : await table.insert({ post_id: postId });
      if (error) throw error;
    },
    onMutate: async ({ postId, liked }) => {
      await queryClient.cancelQueries({ queryKey: communityKeys.feeds });
      const snapshot = queryClient.getQueriesData<FeedData>({ queryKey: communityKeys.feeds });
      updatePost(queryClient, postId, (p) => ({
        ...p,
        liked_by_me: !liked,
        like_count: Math.max(0, p.like_count + (liked ? -1 : 1)),
      }));
      return { snapshot };
    },
    onError: (_e, _v, context) => {
      for (const [key, data] of context?.snapshot ?? []) queryClient.setQueryData(key, data);
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await requireSupabase().from('posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: communityKeys.feeds }),
  });
}

export function useComments(postId: string, enabled: boolean) {
  return useQuery({
    queryKey: communityKeys.comments(postId),
    enabled,
    queryFn: async (): Promise<Comment[]> => {
      const { data, error } = await requireSupabase().rpc('get_comments', { p_post_id: postId });
      if (error) throw error;
      return data;
    },
  });
}

export function useAddComment(postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const { error } = await requireSupabase()
        .from('comments')
        .insert({ post_id: postId, body, is_anonymous: true });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: communityKeys.comments(postId) });
      updatePost(queryClient, postId, (p) => ({ ...p, comment_count: p.comment_count + 1 }));
      refreshGamification(queryClient);
    },
  });
}

export function useReport() {
  return useMutation({
    mutationFn: async (report: {
      post_id?: string;
      comment_id?: string;
      reason: ReportReason;
      details: string | null;
    }) => {
      const { error } = await requireSupabase().from('reports').insert(report);
      // Reporting twice is not an error for the user.
      if (error && error.code !== '23505') throw error;
    },
  });
}

/**
 * Listens for "new post" broadcasts (ids only; see the realtime_feed migration) and reports how
 * many arrived, so the UI can offer a "show new posts" button instead of jumping the feed.
 */
export function useNewPostSignal() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel('community-feed')
      .on('broadcast', { event: 'new_post' }, () => setCount((c) => c + 1))
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);
  return { count, reset: () => setCount(0) };
}

/** Friendly message key for a failed post or comment (database guard errors included). */
export function communityErrorKey(
  error: unknown,
): 'community.errors.blockedLanguage' | 'community.errors.demoReadOnly' | 'common.saveFailed' {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : '';
  if (message.includes('blocked_language')) return 'community.errors.blockedLanguage';
  if (message.includes('demo_read_only')) return 'community.errors.demoReadOnly';
  return 'common.saveFailed';
}
