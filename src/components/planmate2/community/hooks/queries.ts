import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeMateStatus,
  createComment,
  createPost,
  deleteComment,
  deletePost,
  fetchComments,
  fetchFeedPosts,
  mapFeedPost,
  fetchFeedRegionCounts,
  fetchHotPosts,
  fetchLikedPosts,
  fetchMyBadges,
  fetchMyComments,
  fetchMyPosts,
  fetchMyStats,
  fetchAdjacentPosts,
  fetchPost,
  fetchPosts,
  fetchUserBadges,
  fetchUserComments,
  fetchUserPosts,
  fetchUserStats,
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
  post: (postId: number | string, feed = false) => [feed ? 'feed' : 'community', 'post', String(postId)] as const,
  comments: (postId: number | string, feed = false) => [feed ? 'feed' : 'community', 'comments', String(postId)] as const,
  me: (tab: string, page: number) => ['community', 'me', tab, page] as const,
  userPosts: (userId: string, category: string, page: number) => ['community', 'user', userId, 'posts', category, page] as const,
  userComments: (userId: string, page: number, feed = false) =>
    [feed ? 'feed' : 'community', 'user', userId, 'comments', page] as const,
  userStats: (userId: string) => ['community', 'user', userId, 'stats'] as const,
  userBadges: (userId: string) => ['community', 'user', userId, 'badges'] as const,
};

// ── 조회 ─────────────────────────────────────────────────────────────────
export const usePosts = (category: string | undefined, page: number, sort = 'latest', q = '') =>
  useQuery({
    queryKey: KEYS.posts(category ?? '', page, sort, q),
    queryFn: () => fetchPosts(category!, page, 20, sort, q),
    // 상세 화면 하단 목록은 게시글을 받아오기 전까지 카테고리를 모른다
    enabled: !!category,
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

/**
 * 같은 지역의 다른 여행기 (상세 하단 추천).
 *
 * "비슷한 글"의 근거로 쓸 수 있는 건 지금 지역뿐이다 — 본문 유사도는 서버가 계산해 주지 않는다.
 * 지역이 없는 글에서는 아예 조회하지 않는다: 전국 최신글을 "비슷한 여행기"라고 부르면 거짓말이다.
 */
export const useSimilarFeedPosts = (region: string | undefined, excludePostId: number | string) =>
  useQuery({
    queryKey: ['community', 'posts', 'feed', 'similar', region, excludePostId] as const,
    // 지금 글이 섞여 나올 수 있으니 넉넉히 받아 걸러낸다
    queryFn: () => fetchFeedPosts(0, 9, { region, sort: 'likes' }),
    enabled: !!region && region !== '전국',
    staleTime: 30_000,
    select: (page) => page.items
      .filter((p: any) => String(p.id) !== String(excludePostId))
      .slice(0, 4)
      .map(mapFeedPost),
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

export const usePost = (postId: number | string | undefined, feed = false) =>
  useQuery({
    queryKey: KEYS.post(postId ?? '', feed),
    queryFn: () => fetchPost(postId!, feed),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useAdjacentPosts = (postId: number | string | undefined, feed = false) =>
  useQuery({
    queryKey: [...KEYS.post(postId ?? '', feed), 'adjacent'],
    queryFn: () => fetchAdjacentPosts(postId!, feed),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

export const useComments = (postId: number | string | undefined, page = 0, feed = false) =>
  useQuery({
    queryKey: [...KEYS.comments(postId ?? '', feed), page],
    queryFn: () => fetchComments(postId!, page, 50, feed),
    enabled: postId !== undefined && postId !== null && postId !== '',
  });

/**
 * 내 커뮤니티 활동 목록.
 * @param category 게시판 필터 (마이페이지 여행기 = 'feed', 미지정 시 전체).
 *                 'feed'는 별개 도메인이라 comments 도 피드 엔드포인트로 간다.
 * @param enabled  다른 사용자 프로필을 볼 때처럼 내 활동이 필요 없으면 false
 */
export const useMyActivity = (
  tab: 'posts' | 'liked' | 'comments', page = 0, category?: string, enabled = true,
) =>
  useQuery({
    queryKey: KEYS.me(category ? `${tab}:${category}` : tab, page),
    queryFn: () => {
      if (tab === 'posts') return fetchMyPosts(page, 20, category);
      if (tab === 'liked') return fetchLikedPosts(page, 20, category);
      return fetchMyComments(page, 20, category?.toLowerCase() === 'feed');
    },
    enabled,
  });

// 다른 사용자의 프로필에 노출되는 공개 목록 — 여행기(feed)와 커뮤니티 게시글 양쪽에 쓴다.
// category에 쉼표로 여러 게시판을 넘길 수 있다.
export const useUserPosts = (userId: string | undefined, category: string, page = 0) =>
  useQuery({
    queryKey: KEYS.userPosts(userId ?? '', category, page),
    queryFn: () => fetchUserPosts(userId!, category, page),
    enabled: !!userId,
  });

export const useUserComments = (userId: string | undefined, page = 0, feed = false) =>
  useQuery({
    queryKey: KEYS.userComments(userId ?? '', page, feed),
    queryFn: () => fetchUserComments(userId!, page, 20, feed),
    enabled: !!userId,
  });

/** 다른 사용자의 활동 통계 — 레벨 표시에 쓴다 (본인은 useMyStats) */
export const useUserStats = (userId: string | undefined) =>
  useQuery({
    queryKey: KEYS.userStats(userId ?? ''),
    queryFn: () => fetchUserStats(userId!),
    enabled: !!userId,
  });

/** 내 활동 통계(게시글/댓글 수, 레벨) — 로그인 사용자만 조회 가능 */
export const useMyStats = (enabled = true) =>
  useQuery({ queryKey: ['community', 'me', 'stats'], queryFn: fetchMyStats, enabled });

/** 다른 사용자의 뱃지 달성 현황 — 통계와 같은 공개 범위 게이트를 탄다 */
export const useUserBadges = (userId: string | undefined) =>
  useQuery({
    queryKey: KEYS.userBadges(userId ?? ''),
    queryFn: () => fetchUserBadges(userId!),
    enabled: !!userId,
  });

/** 내 뱃지 달성 현황 — 로그인 사용자만 조회 가능 */
export const useMyBadges = (enabled = true) =>
  useQuery({ queryKey: ['community', 'me', 'badges'], queryFn: fetchMyBadges, enabled });

// ── 변경 (공통 무효화 규칙 포함) ─────────────────────────────────────────
const useInvalidate = () => {
  const queryClient = useQueryClient();
  return {
    lists: () => queryClient.invalidateQueries({ queryKey: ['community', 'posts'] })
        .then(() => queryClient.invalidateQueries({ queryKey: ['community', 'hot'] })),
    // 피드와 커뮤니티는 키 네임스페이스가 다르다 — 무효화도 같은 flag 로 맞춰야 한다.
    post: (postId: number | string, feed = false) => queryClient.invalidateQueries({ queryKey: KEYS.post(postId, feed) }),
    comments: (postId: number | string, feed = false) => queryClient.invalidateQueries({ queryKey: KEYS.comments(postId, feed) }),
    me: () => queryClient.invalidateQueries({ queryKey: ['community', 'me'] }),
  };
};

export const useCreatePost = (feed = false) => {
  const invalidate = useInvalidate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => createPost(payload, feed),
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
    onSuccess: () => { invalidate.post(postId, true); invalidate.lists(); },
  });
};

export const useUpdatePost = (postId: number, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload: Partial<CreatePostPayload>) => updatePost(postId, payload, feed),
    onSuccess: () => { invalidate.post(postId, feed); invalidate.lists(); },
  });
};

export const useDeletePost = (feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (postId: number) => deletePost(postId, feed),
    onSuccess: () => { invalidate.lists(); invalidate.me(); },
  });
};

export const useReactToPost = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (type: 'like' | 'dislike') => reactToPost(Number(postId), type, feed),
    onSuccess: () => { invalidate.post(postId, feed); invalidate.lists(); },
  });
};

export const useCreateComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: number }) =>
      createComment(Number(postId), content, parentId, feed),
    onSuccess: () => { invalidate.comments(postId, feed); invalidate.post(postId, feed); invalidate.lists(); },
  });
};

export const useUpdateComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content, feed),
    onSuccess: () => { invalidate.comments(postId, feed); },
  });
};

export const useDeleteComment = (postId: number | string, feed = false) => {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId, feed),
    onSuccess: () => { invalidate.comments(postId, feed); invalidate.post(postId, feed); invalidate.lists(); },
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
