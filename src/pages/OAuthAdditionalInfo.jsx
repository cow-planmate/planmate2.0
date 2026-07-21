import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApiClient } from "../hooks/useApiClient";
import useNicknameStore from "../store/Nickname";

const OAuthAdditionalInfo = () => {
  const navigate = useNavigate();
  const { postWithoutToken, setTokens } = useApiClient();
  const { setNickname, setGravatar } = useNicknameStore();
  const [searchParams] = useSearchParams();

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const signupId = searchParams.get("signupId");
  const needEmail = searchParams.get("needEmail") === "true";

  const [formData, setFormData] = useState({
    email: "",
    age: "",
    gender: "MALE", // 📌 v2 Enum 스펙 반영 ("MALE" | "FEMALE")
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
    if ((needEmail && !formData.email) || !formData.age || !formData.gender) {
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

    const age = parseInt(formData.age, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      setError("올바른 나이를 입력해주세요. (0-150)");
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
      // 📌 나이(age)를 v2 LocalDate 형태("YYYY-01-01")로 변환하여 백엔드 지원
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(formData.age, 10) + 1;
      const formattedBirthdate = `${birthYear}-01-01`;

      // 📌 Native fetch 대신 useApiClient 공통 모듈 활용
      const data = await postWithoutToken(
        `${API_BASE_URL}/api/oauth/complete`,
        {
          signupId,
          email: needEmail ? formData.email : null,
          birthdate: formattedBirthdate,
          gender: formData.gender, // "MALE" | "FEMALE"
        },
      );

      const { accessToken, refreshToken, userId, nickname, email } = data;

      // 로그인 성공 처리
      if (setTokens) setTokens(accessToken, refreshToken);
      if (userId) localStorage.setItem("userId", userId.toString());
      if (nickname && setNickname) setNickname(nickname);
      if (email && setGravatar) setGravatar(email);

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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          추가 정보 입력
        </h2>
        <p className="text-gray-600 mb-6 text-sm">
          서비스 이용을 위해 추가 정보를 입력해주세요.
        </p>

        {/* 안내 메시지 */}
        <div className="mb-6 p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
          <p className="text-xs text-blue-700 font-medium">
            💡 닉네임은 마이페이지에서 변경할 수 있습니다.
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
                placeholder="example@domain.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1344FF]/20 focus:border-[#1344FF] transition-all"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1344FF]/20 focus:border-[#1344FF] transition-all"
            />
          </div>

          {/* 성별 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              성별 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center flex-1 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all select-none">
                <input
                  type="radio"
                  name="gender"
                  value="MALE"
                  checked={formData.gender === "MALE"}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-[#1344FF] focus:ring-[#1344FF]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  남성
                </span>
              </label>
              <label className="flex items-center flex-1 p-3.5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-all select-none">
                <input
                  type="radio"
                  name="gender"
                  value="FEMALE"
                  checked={formData.gender === "FEMALE"}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 text-[#1344FF] focus:ring-[#1344FF]"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  여성
                </span>
              </label>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#1344FF] text-white font-medium rounded-xl hover:bg-[#0030E5] focus:outline-none focus:ring-2 focus:ring-[#1344FF]/50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-sm"
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
