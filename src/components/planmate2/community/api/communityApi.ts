import { getAccessToken, getRefreshToken, refreshTokens } from '../../../../shared/auth/tokenStore';
import { timeAgo } from '../utils/timeAgo';

/**
 * 커뮤니티 마이크로서비스 API 클라이언트.
 * - prod: nginx ingress 경로 라우팅으로 메인 API와 같은 도메인 (/api/community/*)
 * - dev:  VITE_COMMUNITY_API_URL로 별도 포트 지정 가능 (기본 VITE_API_URL)
 * 인증/토큰 갱신은 shared/auth/tokenStore를 공유한다 (Bearer accessToken, 401 시 refresh 후 1회 재시도)
 */
const COMMUNITY_BASE_URL: string =
  import.meta.env.VITE_COMMUNITY_API_URL || import.meta.env.VITE_API_URL;

// ── 응답 타입 (백엔드 DTO와 1:1) ─────────────────────────────────────────

/**
 * 여행기에 박아두는 플랜 스냅샷.
 * "가져가기"가 이 스냅샷만으로 Backend-v2에 플랜을 새로 만들기 때문에,
 * POST /api/plan/full이 요구하는 정보를 빠짐없이 담아야 한다.
 * 구 스키마 게시글에는 없으므로 전부 optional이며, plan이 없으면 가져가기가 불가능하다.
 */
export interface ItineraryPlanSnapshot {
  destinationId: number;
  destinationName?: string | null;
  transportationType: string;
  adultCount?: number | null;
  childCount?: number | null;
}

export interface ItineraryItem {
  time: string; // 블록 시작 시각 HH:mm
  place: string;
  description?: string | null;
  lat?: number | null;
  lng?: number | null;
  category?: string | null; // BlockCategory enum (ATTRACTION/ACCOMMODATION/RESTAURANT/FREE/SEARCH)
  photoUrl?: string | null;
  // 아래는 완전 복제를 위한 확장 필드 (구 스키마 게시글에는 없음)
  endTime?: string | null; // 블록 종료 시각 HH:mm
  placeId?: string | null;
  placeContentTypeId?: string | null;
  placeAddress?: string | null;
  placeCopyrightDivCd?: string | null;
  memo?: string | null; // 작성자가 "메모도 함께 공개"를 켠 경우에만 존재
}

export interface ItineraryDay {
  day: number;
  date?: string | null; // 원본 여행 날짜 (가져갈 때는 사용자가 고른 시작일로 시프트됨)
  startTime?: string | null; // 타임테이블 시작 HH:mm
  endTime?: string | null; // 타임테이블 종료 HH:mm
  items: ItineraryItem[];
}

export interface Itinerary {
  plan?: ItineraryPlanSnapshot | null;
  days: ItineraryDay[];
}

export interface CommunityPostSummary {
  id: number;
  userId: string;
  category: 'free' | 'qna' | 'mate' | 'recommend' | 'feed';
  title: string;
  author: string;
  /** 작성자가 올린 프로필 사진 (없으면 생략) */
  authorImage?: string | null;
  /** 작성자 이메일 해시 — Gravatar 폴백용 (없으면 생략) */
  authorAvatarHash?: string | null;
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
  // 내 활동 목록 전용 — 좋아요/가져가기를 한 시각 (ISO)
  actedAt?: string;
}

export interface CommunityPostDetail extends CommunityPostSummary {
  content: unknown; // BlockNote 블록 JSON
  contentText: string;
  updatedAt?: string;
  myReaction?: 'like' | 'dislike' | null;
  // FEED 전용
  itinerary?: Itinerary | null;
  sourcePlanId?: string;
  myFork?: boolean;
}

export interface CommunityComment {
  id: number;
  postId: number;
  parentId?: number | null; // 대댓글이면 부모 댓글 ID
  userId: string;
  author: string;
  authorImage?: string | null;
  authorAvatarHash?: string | null;
  level: number;
  content: string;
  // 내 활동 목록에서만 내려온다 (원문 표시 + 원문으로 이동)
  postTitle?: string | null;
  postCategory?: string | null;
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

const request = async <T>(path: string, options: RequestInit = {}, retried = false): Promise<T> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${COMMUNITY_BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && getRefreshToken()) {
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

/**
 * 다른 사용자의 프로필에 노출되는 작성글.
 * category에 쉼표로 여러 게시판을 넘길 수 있다 (예: 'free,qna,mate,recommend').
 * 대상이 프로필을 비공개로 두면 403(USER_002)이 온다.
 */
export const fetchUserPosts = async (
  userId: string, category: string, page = 0, size = 20,
): Promise<PageData<CommunityPostSummary>> => {
  const params = new URLSearchParams({ category, page: String(page), size: String(size) });
  return mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/users/${userId}/posts?${params}`));
};

/** 다른 사용자가 쓴 댓글 (원문 제목·이동 정보 포함) */
export const fetchUserComments = async (
  userId: string, page = 0, size = 20,
): Promise<PageData<CommunityComment>> =>
  mapPage(await request<PageData<CommunityComment>>(
    `/api/community/users/${userId}/comments?page=${page}&size=${size}`));

/** 다른 사용자의 활동 통계 (레벨·글 수·댓글 수) */
export const fetchUserStats = async (userId: string): Promise<MyStats> =>
  request<MyStats>(`/api/community/users/${userId}/stats`);

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
});

export type FeedCardPost = ReturnType<typeof mapFeedPost>;

/** 마이페이지 "가져온 여행" 카드 — 원작자와 가져간 시각을 덧붙인다 */
export const mapForkedFeedPost = (post: CommunityPostSummary & { createdAtIso: string }) => ({
  ...mapFeedPost(post),
  originalAuthor: post.author,
  forkedAt: timeAgo(post.actedAt),
});

/** 마이페이지 "좋아요한 여행" 카드 — 좋아요한 시각을 덧붙인다 */
export const mapLikedFeedPost = (post: CommunityPostSummary & { createdAtIso: string }) => ({
  ...mapFeedPost(post),
  likedAt: timeAgo(post.actedAt),
});

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
  // null을 명시하면 수정 시 일정 스냅샷을 비운다 (필드를 생략하면 기존 값 유지)
  itinerary?: Itinerary | null;
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

export const updateComment = async (commentId: number, content: string): Promise<CommunityComment> =>
  mapPost(await request<CommunityComment>(`/api/community/comments/${commentId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
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
// category를 주면 해당 게시판만 (마이페이지 여행기 = feed)
const myActivityQuery = (page: number, size: number, category?: string) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (category) params.set('category', category);
  return params.toString();
};

export const fetchMyPosts = async (page = 0, size = 20, category?: string): Promise<PageData<CommunityPostSummary>> =>
  mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/me/posts?${myActivityQuery(page, size, category)}`));

export const fetchLikedPosts = async (page = 0, size = 20, category?: string): Promise<PageData<CommunityPostSummary>> =>
  mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/me/liked?${myActivityQuery(page, size, category)}`));

/** 내가 가져간(포크한) 피드 글 — 가져간 시각 최신순 */
export const fetchMyForks = async (page = 0, size = 20): Promise<PageData<CommunityPostSummary>> =>
  mapPage(await request<PageData<CommunityPostSummary>>(`/api/community/me/forks?page=${page}&size=${size}`));

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

/** 업로드된 이미지 삭제 (등록/수정 실패 시 방금 올린 이미지 정리용) */
export const deleteImage = async (url: string): Promise<void> => {
  await request<void>(`/api/community/images?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });
};
