/**
 * 토큰 저장소 + 갱신 로직 (메인 백엔드 단일 소스).
 *
 * 커뮤니티는 마이크로서비스지만 JWT를 발급/갱신하지 않고 검증만 하므로,
 * 갱신은 항상 메인 백엔드(VITE_API_URL)로 보낸다.
 * useApiClient.jsx와 community/api/communityApi.ts가 이 모듈을 공유한다.
 */

const MAIN_BASE_URL: string = import.meta.env.VITE_API_URL;

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
