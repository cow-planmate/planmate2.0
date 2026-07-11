// pages/OAuthAdditionalInfo.jsx
import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import useNicknameStore from "../store/Nickname";

const OAuthAdditionalInfo = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTokens } = useApiClient();
  const { setNickname, setGravatar } = useNicknameStore();
  const [searchParams] = useSearchParams();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const signupId = searchParams.get("signupId");
  const needEmail = searchParams.get("needEmail") === "true";

  const [formData, setFormData] = useState({
    email: "",
    age: "",
    gender: "",
  });

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!signupId) {
    navigate("/", { replace: true });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const validateForm = () => {
    if (
      (needEmail && !formData.email) ||
      !formData.age ||
      formData.gender === ""
    ) {
      setError("모든 필드를 입력해주세요.");
      return false;
    }

    if (needEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("올바른 이메일 형식을 입력해주세요.");
        return false;
      }
    }

    const age = parseInt(formData.age);
    if (isNaN(age) || age < 0 || age > 150) {
      setError("올바른 나이를 입력해주세요. (0-150)");
      return false;
    }

    const gender = parseInt(formData.gender);
    if (gender !== 0 && gender !== 1) {
      setError("성별을 선택해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/oauth/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signupId,
          email: needEmail ? formData.email : null,
          age: parseInt(formData.age),
          gender: parseInt(formData.gender),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "추가 정보 등록에 실패했습니다.");
      }

      const data = await response.json();
      const { accessToken, refreshToken, userId, nickname, email } = data;

      // 로그인 성공 처리
      setTokens(accessToken, refreshToken);
      localStorage.setItem("userId", userId.toString());
      setNickname(nickname);
      setGravatar(email);

      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";

      sessionStorage.removeItem("redirectAfterLogin");

      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("추가 정보 등록 실패:", err);
      setError(err.message || "추가 정보 등록에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-pretendard">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          추가 정보 입력
        </h2>
        <p className="text-gray-600 mb-6">
          서비스 이용을 위해 추가 정보를 입력해주세요.
        </p>

        {/* 닉네임 표시 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-gray-500">
            닉네임은 마이페이지에서 변경할 수 있습니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {needEmail && (
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* 나이 입력 */}
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              나이 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="나이를 입력하세요"
              min="0"
              max="150"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 성별 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center flex-1 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="0"
                  checked={formData.gender === "0"}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">남성</span>
              </label>
              <label className="flex items-center flex-1 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="gender"
                  value="1"
                  checked={formData.gender === "1"}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">여성</span>
              </label>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-main text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                처리 중...
              </>
            ) : (
              "완료"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OAuthAdditionalInfo;
