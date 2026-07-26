import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import useNicknameStore from "../store/Nickname";

const OAuthCallback = () => {
  const hasRun = useRef(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { post, get, setTokens } = useApiClient();
  const { setNickname, setGravatar } = useNicknameStore();
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      console.log("OAuth callback params:", Object.fromEntries(searchParams));
      try {
        const status = searchParams.get("status");

        if (status === "SUCCESS") {
          const code = searchParams.get("code");

          if (!code) {
            setError("로그인 코드가 없습니다.");
            return;
          }

          const data = await post(`${API_BASE_URL}/api/oauth/exchange`, {
            code,
          });

          const { accessToken, refreshToken, userId, nickname, email } = data;

          // 토큰 및 사용자 정보 스토리지/Zustand 저장
          if (setTokens) setTokens(accessToken, refreshToken);
          if (nickname && setNickname) setNickname(nickname);
          if (email && setGravatar) setGravatar(email);
          if (userId) localStorage.setItem("userId", userId.toString());

          // userId 전달받지 못했을 경우 프로필 조회를 통한 fallback 처리
          if (!userId) {
            try {
              const userData = await get(`${API_BASE_URL}/api/user/profile`);
              if (userData && userData.userId) {
                localStorage.setItem("userId", userData.userId.toString());
              }
            } catch (err) {
              console.error("사용자 프로필 조회 실패:", err);
            }
          }

          const redirectPath =
            sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin");

          navigate(redirectPath, { replace: true });
        }
        // 신규 사용자 - 추가 정보 입력 필요
        else if (status === "NEED_ADDITIONAL_INFO") {
          const signupId = searchParams.get("signupId");
          const needEmail = searchParams.get("needEmail") === "true";

          if (!signupId) {
            setError("가입 세션이 올바르지 않습니다.");
            return;
          }

          navigate(
            `/oauth/additional-info?signupId=${signupId}&needEmail=${needEmail}`,
            { replace: true },
          );
        } else if (status === "FAIL") {
          const reason = searchParams.get("reason");

          if (reason === "EMAIL_CONFLICT") {
            setError(
              "이미 해당 이메일로 가입된 계정이 있습니다. planMate 일반 계정으로 로그인해주세요.",
            );
          } else {
            setError("OAuth 로그인에 실패했습니다.");
          }
        }
        // 알 수 없는 상태
        else {
          setError("OAuth 로그인 중 오류가 발생했습니다.");
        }
      } catch (err) {
        console.error("OAuth 콜백 처리 실패:", err);
        setError(err.message || "로그인 처리 중 오류가 발생했습니다.");
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-pretendard p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center border border-gray-100">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인 실패</h2>
          <p className="text-red-600 mb-6 text-sm">{error}</p>
          <button
            onClick={() => {
              const redirectPath =
                sessionStorage.getItem("redirectAfterLogin") || "/";
              sessionStorage.removeItem("redirectAfterLogin");
              navigate(redirectPath, { replace: true });
            }}
            className="w-full py-3.5 bg-[#1344FF] text-white font-medium rounded-xl hover:bg-[#0030E5] transition-all shadow-sm"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-pretendard">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#1344FF] border-t-transparent mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          로그인 처리 중...
        </h2>
        <p className="text-sm text-gray-500">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
