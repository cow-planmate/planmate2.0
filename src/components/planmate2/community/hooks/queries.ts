import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeMateStatus,
  createComment,
  createPost,
  deleteComment,
  deletePost,
  fetchComments,
  fetchFeedPosts,
  fetchFeedRegionCounts,
  fetchHotPosts,
  fetchLikedPosts,
  fetchMyComments,
  fetchMyForks,
  fetchMyPosts,
  fetchMyStats,
  fetchPost,
  fetchPosts,
  fetchUserPosts,
  forkPost,
  joinMate,
  leaveMate,
  reactToPost,
  updateAnswered,
  updateComment,
  updatePost,
  type CreatePostPayload,
  type FeedFilterParams,
} from '../api/communityApi';

const KEYS = {
  posts: (category: string, page: number, sort: string, q: string) => ['community', 'posts', category, page, sort, q] as const,
  hot: (category: string) => ['community', 'hot', category] as const,
  post: (postId: number | string) => ['community', 'post', String(postId)] as const,
  comments: (postId: number | string) => ['community', 'comments', String(postId)] as const,
  me: (tab: string, page: number) => ['community', 'me', tab, page] as const,
  userPosts: (userId: string, category: string, page: number) => ['community', 'user', userId, category, page] as const,
};

// ── 조회 ─────────────────────────────────────────────────────────────────
export const usePosts = (category: string, page: number, sort = 'latest', q = '') =>
  useQuery({
    queryKey: KEYS.posts(category, page, sort, q),
    queryFn: () => fetchPosts(category, page, 20, sort, q),
    staleTime: 30_000,
  });

// 피드 목록 — 서버사이드 필터 + 무한 스크롤("더 보기")
export const useFeedPosts = (filters: FeedFilterParams, size = 12) =>
  useInfiniteQuery({
    queryKey: ['community', 'posts', 'feed', filters, size] as const,
    queryFn: ({ pageParam }) => fetchFeedPosts(pageParam, size, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 30_000,
  });

export const useFeedRegionCounts = () =>
  useQuery({
    queryKey: ['community', 'feed-regions'],
    queryFn: fetchFeedRegionCounts,
    staleTime: 60_000,
  });

export const useHotPosts = (category: string) =>
  useQuery({
    queryKey: KEYS.hot(category),
    queryFn: () => fetchHotPosts(category),
    staleTime: 60_000,
  });

export const usePost = (postId: number | string | undefined) =>
  useQuery({
    queryKey: KEYS.post(postId ?? ''),
    queryFn: () => fetchPost(postId!),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useComments = (postId: number | string | undefined, page = 0) =>
  useQuery({
    queryKey: [...KEYS.comments(postId ?? ''), page],
    queryFn: () => fetchComments(postId!, page),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

/**
 * 내 커뮤니티 활동 목록.
 * @param category 게시판 필터 (마이페이지 여행기 = 'feed', 미지정 시 전체) — posts/liked에만 적용
 * @param enabled  다른 사용자 프로필을 볼 때처럼 내 활동이 필요 없으면 false
 */
export const useMyActivity = (
  tab: 'posts' | 'liked' | 'comments' | 'forks', page = 0, category?: string, enabled = true,
) =>
  useQuery({
    queryKey: KEYS.me(category ? `${tab}:${category}` : tab, page),
    queryFn: () => {
      if (tab === 'posts') return fetchMyPosts(page, 20, category);
      if (tab === 'liked') return fetchLikedPosts(page, 20, category);
      if (tab === 'forks') return fetchMyForks(page);
      return fetchMyComments(page);
    },
    enabled,
  });

// 다른 사용자의 프로필에 노출되는 공개 목록 (여행기 등)
export const useUserPosts = (userId: string | undefined, category: string, page = 0) =>
  useQuery({
    queryKey: KEYS.userPosts(userId ?? '', category, page),
    queryFn: () => fetchUserPosts(userId!, category, page),
    enabled: !!userId,
  });

export const useMyStats = () =>
  useQuery({ queryKey: ['community', 'me', 'stats'], queryFn: fetchMyStats });

// ── 변경 (공통 무효화 규칙 포함) ─────────────────────────────────────────
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return {
    lists: () => queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
        .then(() => queryClient.invalidateQueries({ queryKey: ['community', 'hot'] })),
    post: (postId: number | string) => queryClient.invalidateQueries({ queryKey: KEYS.post(postId) }),
    comments: (postId: number | string) => queryClient.invalidateQueries({ queryKey: KEYS.comments(postId) }),
    me: () => queryClient.invalidateQueries({ queryKey: ['community', 'me'] }),
  };
};

export const useCreatePost = () => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload),
    onSuccess: () => {
      invalidate.lists();
      invalidate.me();
      queryClient.invalidateQueries({ queryKey: ['community', 'feed-regions'] });
    },
  });
};

export const useForkPost = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => forkPost(postId),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useUpdatePost = (postId: number) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<CreatePostPayload>) => updatePost(postId, payload),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useDeletePost = () => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => { invalidate.lists(); invalidate.me(); },
  });
};

export const useReactToPost = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (type: 'like' | 'dislike') => reactToPost(Number(postId), type),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useCreateComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: number }) =>
      createComment(Number(postId), content, parentId),
    onSuccess: () => { invalidate.comments(postId); invalidate.post(postId); invalidate.lists(); },
  });
};

export const useUpdateComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => { invalidate.comments(postId); },
  });
};

export const useDeleteComment = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => { invalidate.comments(postId); invalidate.post(postId); invalidate.lists(); },
  });
};

export const useJoinMate = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => joinMate(Number(postId)),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useLeaveMate = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: () => leaveMate(Number(postId)),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useChangeMateStatus = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (status: 'recruiting' | 'closed') => changeMateStatus(Number(postId), status),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};

export const useUpdateAnswered = (postId: number | string) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (isAnswered: boolean) => updateAnswered(Number(postId), isAnswered),
    onSuccess: () => { invalidate.post(postId); invalidate.lists(); },
  });
};
