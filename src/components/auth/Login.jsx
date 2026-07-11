// components/Login.jsx
import React, { useState, useEffect } from "react";
import { useApiClient } from "../../hooks/useApiClient";
import google from "../../assets/imgs/googleicon.png";
import naver from "../../assets/imgs/navericon.png";
import { useLocation } from "react-router-dom";
import { ErrorToast } from "../common/Toast";

export default function Login({
  isOpen,
  onClose,
  onPasswordFindOpen,
  onSignupOpen,
  onLoginSuccess,
}) {
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formError, setFormError] = useState("");
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // API 클라이언트 훅 사용
  const { login, isLoading, error } = useApiClient();

  // 모달이 열릴 때마다 폼 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: "", password: "" });
      setFormError("");
    }
  }, [isOpen]);

  // 입력값 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError("");
  };

  // 유효성 검증
  const validateForm = () => {
    if (!formData.email.trim()) {
      setFormError("이메일을 입력해주세요.");
      return false;
    }
    if (!formData.password.trim()) {
      setFormError("비밀번호를 입력해주세요.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    return true;
  };

  // 로그인 처리
  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const result = await login(formData.email, formData.password);

      // 로그인 성공 콜백 호출
      if (onLoginSuccess) {
        onLoginSuccess(result);
      }

      // 모달 닫기
      onClose();
    } catch (err) {
      // 에러는 useApiClient에서 자동으로 설정됨
      console.error("로그인 실패:", err);
      ErrorToast(String(err).replace("Error: ", ""));
    }
  };

  // Enter 키로 로그인
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  const handleSNSLogin = (provider) => {
    sessionStorage.setItem("redirectAfterLogin", location.pathname);

    window.location.href = `${API_BASE_URL}/api/oauth/${provider}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-pretendard">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
          disabled={isLoading}
        >
          ×
        </button>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          로그인
        </h1>

        <div className="space-y-6">
          {/* 에러 메시지 표시 */}
          {(error || formError) && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {formError || error}
            </div>
          )}

          <div>
            <label className=" block text-left left-2 text-sm font-medium text-gray-700 mb-2 pl-2">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="이메일을 입력하세요"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-left left-2 text-sm font-medium text-gray-700 mb-2 pl-2">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex justify-center py-2 gap-4">
            <button
              onClick={() => handleSNSLogin("google")}
              disabled={isLoading}
              title="구글 로그인"
            >
              <img src={google} alt="Google Logo" className="w-7 h-7" />
            </button>

            <button
              onClick={() => handleSNSLogin("naver")}
              disabled={isLoading}
              title="네이버 로그인"
            >
              <img
                src={naver}
                alt="Naver Logo"
                className="w-7 h-7 rounded-full"
              />
            </button>
          </div>
          <div className="flex justify-center -mt-2 mb-2">
            <button
              type="button"
              className="text-xs text-blue-600 underline hover:text-blue-800"
              onClick={() => setShowPrivacyModal(true)}
              disabled={isLoading}
            >
              개인정보 처리방침
            </button>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-[6rem] py-3 bg-main text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "로그인"
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-8 text-sm text-gray-500">
          <button
            className="hover:text-gray-700 disabled:cursor-not-allowed"
            onClick={onPasswordFindOpen}
            disabled={isLoading}
          >
            비밀번호 찾기
          </button>
          <button
            className="hover:text-gray-700 disabled:cursor-not-allowed"
            onClick={onSignupOpen}
            disabled={isLoading}
          >
            회원가입
          </button>
        </div>

        {showPrivacyModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]"
            onClick={() => setShowPrivacyModal(false)}
          >
            <div
              className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 relative max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>

              <h2 className="text-xl font-bold text-gray-900 mb-4">
                개인정보 처리방침
              </h2>

              <div className="text-sm text-gray-600 leading-relaxed text-left space-y-3">
                <div>
                  <p className="font-bold mb-1">1. 수집·이용 목적</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>회원 관리 및 서비스 제공</li>
                    <li>문의 대응 및 공지사항 전달</li>
                    <li>맞춤형 서비스 제공 및 이벤트 안내</li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-1">2. 수집하는 개인정보 항목</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>필수 항목: 이메일, 비밀번호, 닉네임, 나이, 성별</li>
                    <li>
                      SNS 계정 로그인 시: 이메일 주소, 프로필 정보(닉네임,
                      프로필 이미지 등) 및 서비스 제공에 필요한 최소한의 계정
                      식별자
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-1">3. 개인정보 보유·이용 기간</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>회원 탈퇴 시 지체 없이 파기</li>
                    <li>
                      단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안
                      보관
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-1">
                    4. 동의 거부 권리 및 불이익 안내
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>
                      회원가입 시 필수 항목 동의를 거부할 경우 회원가입이
                      불가합니다.
                    </li>
                    <li>
                      선택 항목은 동의하지 않아도 회원가입은 가능하며, 일부
                      서비스 이용이 제한될 수 있습니다.
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-bold mb-1">5. SNS 계정 로그인 관련 안내</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    <li>
                      구글 등 외부 SNS 제공자는 OAuth 인증을 통해 로그인 기능만
                      제공하며, 회원님의 비밀번호를 당사에 제공하지 않습니다.
                    </li>
                    <li>
                      당사는 SNS 제공자로부터 제공받은 최소한의 정보(이메일,
                      프로필 정보 등)를 회원 식별 및 서비스 제공 목적에 한정하여
                      이용합니다.
                    </li>
                    <li>
                      SNS 계정 연동 해제 또는 회원 탈퇴 시, 관련 정보는 법령에
                      따른 보존 의무가 없는 한 지체 없이 파기됩니다.
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setShowPrivacyModal(false)}
                className="w-full mt-6 py-2 bg-main hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
