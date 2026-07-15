import { timeAgo } from '../utils/timeAgo';

/**
 * 커뮤니티 마이크로서비스 API 클라이언트.
 * - prod: nginx ingress 경로 라우팅으로 메인 API와 같은 도메인 (/api/community/*)
 * - dev:  VITE_COMMUNITY_API_URL로 별도 포트 지정 가능 (기본 VITE_API_URL)
 * 인증/토큰 갱신 규약은 useApiClient.jsx와 동일 (Bearer accessToken, 401 시 메인 API로 refresh 후 1회 재시도)
 */
const COMMUNITY_BASE_URL: string =
  import.meta.env.VITE_COMMUNITY_API_URL || import.meta.env.VITE_API_URL;
const MAIN_BASE_URL: string = import.meta.env.VITE_API_URL;

// ── 응답 타입 (백엔드 DTO와 1:1) ─────────────────────────────────────────
export interface ItineraryItem {
  time: string;
  place: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string | null;
  photoUrl?: string | null;
}

export interface ItineraryDay {
  day: number;
  date?: string | null;
  items: ItineraryItem[];
}

export interface CommunityPostSummary {
  id: number;
  userId: string;
  category: 'free' | 'qna' | 'mate' | 'recommend' | 'feed';
  title: string;
  author: string;
  level: number;
  likes: number;
  dislikes: number;
  comments: number;
  views: number;
  createdAt: string; // 상대시간으로 변환됨 ("3시간 전")
  createdAtIso: string;
  image?: string;
  isAnswered?: boolean;
  participants?: number;
  maxParticipants?: number;
  status?: 'recruiting' | 'closed';
  region?: string;
  location?: string;
  rating?: string;
  coords?: { lat: number; lng: number };
  // FEED 전용 (비-FEED는 응답에서 생략)
  durationDays?: number;
  forks?: number;
  tags?: string[];
  description?: string;
}

export interface CommunityPostDetail extends CommunityPostSummary {
  content: unknown; // BlockNote 블록 JSON
  contentText: string;
  updatedAt?: string;
  myReaction?: 'like' | 'dislike' | null;
  // FEED 전용
  itinerary?: { days: ItineraryDay[] } | null;
  sourcePlanId?: string;
  myFork?: boolean;
}

export interface CommunityComment {
  id: number;
  postId: number;
  parentId?: number | null; // 대댓글이면 부모 댓글 ID
  userId: string;
  author: string;
  level: number;
  content: string;
  createdAt: string;
  createdAtIso: string;
}

export interface RegionCount {
  region: string;
  count: number;
}

export interface ForkResult {
  forks: number;
  myFork: boolean;
}

export interface PageData<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ReactionResult {
  likes: number;
  dislikes: number;
  myReaction?: 'like' | 'dislike' | null;
}

export interface MateParticipation {
  participants: number;
  maxParticipants?: number;
  status?: 'recruiting' | 'closed';
}

export interface MyStats {
  userId: string;
  postCount: number;
  commentCount: number;
  level: number;
}

// ── 인증 유틸 (useApiClient.jsx 규약 동일) ──────────────────────────────
const getAccessToken = () => localStorage.getItem('accessToken');

const refreshTokens = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');
  const res = await fetch(`${MAIN_BASE_URL}/api/auth/token?refreshToken=${refreshToken}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('토큰 갱신 실패');
  const data = await res.json();
  localStorage.setItem('accessToken', data.accessToken);
  return data.accessToken as string;
};

const request = async <T>(path: string, options: RequestInit = {}, retried = false): Promise<T> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${COMMUNITY_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && localStorage.getItem('refreshToken')) {
    await refreshTokens();
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.message || `요청 실패: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

// ── 응답 매핑 (createdAt → 상대시간, 컴포넌트 호환) ─────────────────────
const mapPost = <T extends { createdAt: string }>(post: T): T & { createdAtIso: string } => ({
  ...post,
  createdAtIso: post.createdAt,
  createdAt: timeAgo(post.createdAt),
});

const mapPage = <T extends { createdAt: string }>(page: PageData<T>) => ({
  ...page,
  items: page.items.map(mapPost),
});

// ── 게시글 ───────────────────────────────────────────────────────────────
export const fetchPosts = async (
  category: string, page: number, size: number, sort: string, q?: string,
): Promise<PageData<CommunityPostSummary>> => {
  const params = new URLSearchParams({ category, page: String(page), size: String(size), sort });
  if (q && q.trim()) params.set('q', q.trim());
  return mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/posts?${params}`));
};

// ── 피드 ─────────────────────────────────────────────────────────────────
export interface FeedFilterParams {
  region?: string;
  minDays?: number;
  maxDays?: number;
  tag?: string;
  sort?: string; // latest | likes | views | forks
  q?: string;
}

export const fetchFeedPosts = async (
  page: number, size: number, filters: FeedFilterParams = {},
): Promise<PageData<CommunityPostSummary>> => {
  const params = new URLSearchParams({ category: 'feed', page: String(page), size: String(size), sort: filters.sort ?? 'latest' });
  if (filters.region) params.set('region', filters.region);
  if (filters.minDays !== undefined) params.set('minDays', String(filters.minDays));
  if (filters.maxDays !== undefined) params.set('maxDays', String(filters.maxDays));
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.q && filters.q.trim()) params.set('q', filters.q.trim());
  return mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/posts?${params}`));
};

export const fetchFeedRegionCounts = async (): Promise<RegionCount[]> =>
  request<RegionCount[]>('/api/community/posts/regions?category=feed');

export const forkPost = async (postId: number | string): Promise<ForkResult> =>
  request<ForkResult>(`/api/community/posts/${postId}/fork`, { method: 'POST' });

/** durationDays → "N박 M일" 표기 (1일 여행은 "1일") */
export const formatDuration = (durationDays?: number): string => {
  if (!durationDays || durationDays < 1) return '';
  return durationDays === 1 ? '1일' : `${durationDays - 1}박 ${durationDays}일`;
};

const FEED_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800';

/** 피드 카드 컴포넌트가 기대하는 형태로 변환 (목데이터 시절 필드명 호환) */
export const mapFeedPost = (post: CommunityPostSummary & { createdAtIso: string }) => ({
  ...post,
  destination: post.location ?? post.region ?? '',
  duration: formatDuration(post.durationDays),
  tags: post.tags ?? [],
  forks: post.forks ?? 0,
  image: post.image ?? FEED_FALLBACK_IMAGE,
  description: post.description ?? '',
  authorImage: undefined as string | undefined, // 레거시 User에 프로필 이미지 없음 → 카드에서 이니셜 폴백
});

export type FeedCardPost = ReturnType<typeof mapFeedPost>;

export const fetchHotPosts = async (category: string): Promise<CommunityPostSummary[]> => {
  const posts = await request<CommunityPostSummary[]>(`/api/community/posts/hot?category=${category}`);
  return posts.map(mapPost);
};

export const fetchPost = async (postId: number | string): Promise<CommunityPostDetail> =>
  mapPost(await request<CommunityPostDetail>(`/api/community/posts/${postId}`));

export interface CreatePostPayload {
  category: string;
  title: string;
  content: unknown;
  contentText: string;
  thumbnailUrl?: string | null;
  location?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  region?: string;
  maxParticipants?: number | null;
  // FEED 전용
  durationDays?: number;
  itinerary?: { days: ItineraryDay[] };
  tags?: string[];
  sourcePlanId?: string;
}

export const createPost = async (payload: CreatePostPayload): Promise<CommunityPostDetail> =>
  mapPost(await request<CommunityPostDetail>('/api/community/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }));

export const updatePost = async (postId: number, payload: Partial<CreatePostPayload>): Promise<CommunityPostDetail> =>
  mapPost(await request<CommunityPostDetail>(`/api/community/posts/${postId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }));

export const deletePost = async (postId: number): Promise<void> =>
  request<void>(`/api/community/posts/${postId}`, { method: 'DELETE' });

// ── 반응 ─────────────────────────────────────────────────────────────────
export const reactToPost = async (postId: number, type: 'like' | 'dislike'): Promise<ReactionResult> =>
  request<ReactionResult>(`/api/community/posts/${postId}/reaction`, {
    method: 'PUT',
    body: JSON.stringify({ type }),
  });

// ── 댓글 ─────────────────────────────────────────────────────────────────
export const fetchComments = async (postId: number | string, page = 0, size = 50): Promise<PageData<CommunityComment>> =>
  mapPage(await request<PageData<CommunityComment>>(`/api/community/posts/${postId}/comments?page=${page}&size=${size}`));

export const createComment = async (postId: number, content: string, parentId?: number): Promise<CommunityComment> =>
  mapPost(await request<CommunityComment>(`/api/community/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(parentId != null ? { content, parentId } : { content }),
  }));

export const deleteComment = async (commentId: number): Promise<void> =>
  request<void>(`/api/community/comments/${commentId}`, { method: 'DELETE' });

// ── 메이트 / QnA ─────────────────────────────────────────────────────────
export const joinMate = async (postId: number): Promise<MateParticipation> =>
  request<MateParticipation>(`/api/community/posts/${postId}/participants`, { method: 'POST' });

export const leaveMate = async (postId: number): Promise<MateParticipation> =>
  request<MateParticipation>(`/api/community/posts/${postId}/participants`, { method: 'DELETE' });

export const changeMateStatus = async (postId: number, status: 'recruiting' | 'closed'): Promise<MateParticipation> =>
  request<MateParticipation>(`/api/community/posts/${postId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const updateAnswered = async (postId: number, isAnswered: boolean): Promise<CommunityPostDetail> =>
  mapPost(await request<CommunityPostDetail>(`/api/community/posts/${postId}/answered`, {
    method: 'PATCH',
    body: JSON.stringify({ isAnswered }),
  }));

// ── 내 활동 ──────────────────────────────────────────────────────────────
export const fetchMyPosts = async (page = 0, size = 20): Promise<PageData<CommunityPostSummary>> =>
  mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/me/posts?page=${page}&size=${size}`));

export const fetchLikedPosts = async (page = 0, size = 20): Promise<PageData<CommunityPostSummary>> =>
  mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/me/liked?page=${page}&size=${size}`));

export const fetchMyComments = async (page = 0, size = 20): Promise<PageData<CommunityComment>> =>
  mapPage(await request<PageData<CommunityComment>>(`/api/community/me/comments?page=${page}&size=${size}`));

export const fetchMyStats = async (): Promise<MyStats> =>
  request<MyStats>('/api/community/me/stats');

// ── 이미지 업로드 (BlockNote uploadFile용) ───────────────────────────────
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request<{ url: string }>('/api/community/images', {
    method: 'POST',
    body: formData,
  });
  return res.url;
};
