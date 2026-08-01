import { getAccessToken, getRefreshToken, refreshTokens } from '../../../../shared/auth/tokenStore';
import type { PreferredTheme } from '../types';

/**
 * 메인 백엔드(Backend-v2)의 사용자 프로필 API 클라이언트.
 * 인증/토큰 갱신 방식은 커뮤니티 API 클라이언트와 동일하게 tokenStore를 공유한다.
 */
const BASE_URL: string = (import.meta as any).env.VITE_API_URL;

/**
 * 타인에게 노출되는 프로필 (GET /api/user/profile/{userId}).
 * 이메일·생년월일(나이)·성별은 서버가 아예 내려주지 않는다 — 화면에서 감추는 게 아니라 응답에 없다.
 */
export interface PublicUserProfile {
  userId: string;
  nickname: string;
  /** null이면 클라이언트가 Gravatar로 대체한다 */
  profileImageUrl: string | null;
  preferredThemes: PreferredTheme[];
  myPlanCount: number;
  editablePlanCount: number;
}

/** 비공개 프로필 조회 시 서버가 403 + USER_002로 응답한다 */
export class ProfilePrivateError extends Error {
  constructor() {
    super('비공개 프로필입니다.');
    this.name = 'ProfilePrivateError';
  }
}

const request = async <T>(path: string, options: RequestInit = {}, retried = false): Promise<T> => {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    // FormData는 브라우저가 boundary를 포함한 Content-Type을 직접 설정해야 한다
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && !retried && getRefreshToken()) {
    await refreshTokens();
    return request<T>(path, options, true);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    if (res.status === 403 && errorBody?.code === 'USER_002') {
      throw new ProfilePrivateError();
    }
    throw new Error(errorBody?.message || `요청 실패: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
};

export const fetchPublicProfile = (userId: string): Promise<PublicUserProfile> =>
  request<PublicUserProfile>(`/api/user/profile/${userId}`);

/** 프로필 이미지 업로드 — 새 공개 URL을 돌려준다 (기존 이미지는 서버가 정리한다) */
export const uploadProfileImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await request<{ profileImageUrl: string }>('/api/user/profile-image', {
    method: 'POST',
    body: formData,
  });
  return res.profileImageUrl;
};

/** 프로필 이미지 제거 — 다시 Gravatar로 표시된다 */
export const deleteProfileImage = (): Promise<void> =>
  request<void>('/api/user/profile-image', { method: 'DELETE' });

export const updateProfileVisibility = (profilePublic: boolean): Promise<void> =>
  request<void>('/api/user/profile/visibility', {
    method: 'PATCH',
    body: JSON.stringify({ profilePublic }),
  });
