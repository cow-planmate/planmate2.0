// hooks/useApiClient.js
import { useState, useCallback } from "react";
import useServerStatusStore from "../store/ServerStatus";
import useNicknameStore from "../store/Nickname";

/**
 * API 클라이언트 훅
 * 토큰 인증이 포함된 fetch 요청을 쉽게 사용할 수 있도록 도와주는 커스텀 훅
 */
export const useApiClient = () => {
  const { setNickname, setGravatar } = useNicknameStore();
  const { setServerDown } = useServerStatusStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  // 1. 토큰 관련 유틸리티 함수들
  const getAccessToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);

  const getRefreshToken = useCallback(() => {
    return localStorage.getItem("refreshToken");
  }, []);

  const setTokens = useCallback((accessToken, refreshToken) => {
    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }, []);
  

  const clearAuth = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("nickname");
  }, []);

  const refreshTokens = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("리프레시 토큰이 없습니다.");
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/token?refreshToken=${refreshToken}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("토큰 갱신 실패");
      }

      const data = await response.json();

      setTokens(data.accessToken, refreshToken);

      return data.accessToken;
    } catch (error) {
      console.error("토큰 갱신 실패:", error.message);
      clearAuth();
      throw error;
    }
  }, [getRefreshToken, setTokens, clearAuth, BASE_URL]);

  // 3. 인증 헤더 생성 함수
  const getAuthHeaders = useCallback(() => {
    const token = getAccessToken();
    const headers = {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json; charset=utf-8",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }, [getAccessToken]);

  // 4. API 요청 함수 (토큰 자동 포함)
  const apiRequest = useCallback(
  async (url, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const config = {
        ...options,
        headers: {
          ...getAuthHeaders(),
          ...options.headers,
        },
      };

      let response;
      try {
        response = await fetch(url, config);
      } catch (networkError) {
        // 🔥 서버 다운 / 네트워크 단절
        setServerDown();
        throw networkError;
      }

      // 🔥 서버 5xx 에러
      if (response.status >= 500) {
        setServerDown();
        throw new Error("서버 오류가 발생했습니다.");
      }

      // 인증 에러 처리
      if (response.status === 401) {
        try {
          await refreshTokens();

          const retryConfig = {
            ...options,
            headers: {
              ...getAuthHeaders(),
              ...options.headers,
            },
          };

          const retryResponse = await fetch(url, retryConfig);

          // 🔥 재시도 중 서버 다운
          if (retryResponse.status >= 500) {
            setServerDown();
            throw new Error("서버 오류가 발생했습니다.");
          }

          if (retryResponse.ok) {
            return await retryResponse.json();
          } else {
            throw new Error("토큰 갱신 후에도 요청이 실패했습니다.");
          }
        } catch (refreshError) {
          clearAuth();
          throw new Error("인증이 만료되었습니다. 다시 로그인해주세요.");
        }
      }

      if (response.status === 403) {
        throw new Error("접근 권한이 없습니다.");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || `API 요청 실패: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (err) {
      console.error("API 요청 에러:", err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  },
  [getAuthHeaders, refreshTokens, clearAuth, setServerDown]
);

  // 5. 편의 메서드들
  const get = useCallback(
    (url) => apiRequest(url, { method: "GET" }),
    [apiRequest]
  );

  const post = useCallback(
    (url, data) =>
      apiRequest(url, { method: "POST", body: JSON.stringify(data) }),
    [apiRequest]
  );

  const patch = useCallback(
    (url, data) =>
      apiRequest(url, { method: "PATCH", body: JSON.stringify(data) }),
    [apiRequest]
  );

  const put = useCallback(
    (url, data) =>
      apiRequest(url, { method: "PUT", body: JSON.stringify(data) }),
    [apiRequest]
  );

  const del = useCallback(
    (url, data) =>
      apiRequest(url, {
        method: "DELETE",
        body: data ? JSON.stringify(data) : undefined,
      }),
    [apiRequest]
  );

  // 6. FormData 전송을 위한 별도 메서드 (파일 업로드용)
  const postFormData = useCallback(
    (url, formData) => {
      const token = getAccessToken();
      const headers = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      return apiRequest(url, {
        method: "POST",
        headers,
        body: formData,
      });
    },
    [apiRequest, getAccessToken]
  );
  const login = useCallback(
    async (email, password) => {
      try {
        const response = await post(`${BASE_URL}/api/auth/login`, {
          email,
          password,
        });

        if (!response.accessToken || !response.refreshToken) {
          throw new Error(
            response.message ||
              "로그인에 실패했습니다. 아이디 또는 비밀번호를 확인해주세요."
          );
        }

        setTokens(response.accessToken, response.refreshToken);

        if (response.userId) {
          localStorage.setItem("userId", response.userId.toString());
        }
        if (response.nickname) {
          setNickname(response.nickname);
        }
        if (response.email) {
          setGravatar(response.email);
        }

        return response;
      } catch (err) {
        console.error("로그인 프로세스 에러:", err.message);
        throw err;
      }
    },
    [post, setTokens, BASE_URL]
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await post(`${BASE_URL}/api/auth/logout`, {
          refreshToken,
        });
      }
    } catch (err) {
      console.error("로그아웃 API 호출 실패:", err.message);
    } finally {
      clearAuth();
    }
  }, [post, getRefreshToken, clearAuth, BASE_URL]);

  const isAuthenticated = useCallback(() => {
    return !!getAccessToken();
  }, [getAccessToken]);

  return {
    // 상태
    isLoading,
    error,

    // API 메서드
    get,
    post,
    patch,
    put,
    del,
    postFormData,
    apiRequest, // 커스텀 요청용

    // 토큰 관리
    getAccessToken,
    getRefreshToken,
    setTokens,
    refreshTokens,
    clearAuth,

    // 인증 관련
    login,
    logout,
    isAuthenticated,
  };
};
