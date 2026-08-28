/**
 * 토큰 저장소 + 갱신 로직 (메인 백엔드 단일 소스).
 *
 * 커뮤니티는 마이크로서비스지만 JWT를 발급/갱신하지 않고 검증만 하므로,
 * 갱신은 항상 메인 백엔드(VITE_API_URL)로 보낸다.
 * useApiClient.jsx와 community/api/communityApi.ts가 이 모듈을 공유한다.
 */

const MAIN_BASE_URL: string = import.meta.env.VITE_API_URL;
const REFRESH_SKEW_SECONDS = 30;

export const getAccessToken = (): string | null => localStorage.getItem('accessToken');

export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

export const setTokens = (accessToken: string, refreshToken: string): void => {
  if (accessToken && refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

export const clearAuth = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('nickname');
};

const isAccessTokenExpiring = (token: string): boolean => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = JSON.parse(atob(padded)) as { exp?: number };

    return typeof decoded.exp !== 'number'
      || decoded.exp <= Math.floor(Date.now() / 1000) + REFRESH_SKEW_SECONDS;
  } catch {
    // 손상된 토큰은 만료된 토큰처럼 취급해 서버 요청 전에 갱신을 시도한다.
    return true;
  }
};

/** 동시에 401을 받은 요청들이 갱신을 중복 호출하지 않도록 진행 중인 요청을 공유한다 */
let inFlight: Promise<string> | null = null;

export const refreshTokens = async (): Promise<string> => {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) throw new Error('리프레시 토큰이 없습니다.');

    const res = await fetch(`${MAIN_BASE_URL}/api/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) throw new Error('토큰 갱신 실패');

    const data = await res.json();
    // 백엔드는 accessToken만 재발급한다 (리프레시 토큰 로테이션 없음)
    setTokens(data.accessToken, refreshToken);
    return data.accessToken as string;
  })();

  try {
    return await inFlight;
  } catch (error) {
    // 갱신 실패는 세션이 끝났다는 뜻이므로 남은 토큰을 정리한다
    clearAuth();
    throw error;
  } finally {
    inFlight = null;
  }
};

/**
 * 앱의 인증 API들이 동시에 시작되기 전에 저장된 세션을 복원한다.
 * access token이 아직 충분히 유효하면 네트워크 요청 없이 끝내고, 만료됐거나 곧 만료될
 * 때만 refresh token으로 한 번 갱신한다.
 */
export const initializeAuth = async (): Promise<void> => {
  const accessToken = getAccessToken();
  if (!accessToken || !isAccessTokenExpiring(accessToken)) return;

  if (!getRefreshToken()) {
    clearAuth();
    return;
  }

  try {
    await refreshTokens();
  } catch {
    // refreshTokens가 더 이상 복원할 수 없는 세션을 이미 정리한다.
  }
};
