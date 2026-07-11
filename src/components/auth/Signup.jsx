import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Check, X } from "lucide-react";
import { useApiClient } from "../../hooks/useApiClient";
import { ErrorToast, SuccessToast, WarningToast } from "../common/Toast";

export default function Signup({
  isOpen = true,
  onClose = () => { },
  onLoginSuccess,
  onThemeOpen,
}) {
  const BASE_URL = import.meta.env.VITE_API_URL;

  const { login } = useApiClient();
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
    nickname: "",
    age: "",
    gender: "male",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isNicknameVerified, setIsNicknameVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  // 비밀번호 검증 상태
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasMaxLength: true,
    hasEnglish: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasAllRequired: false,
  });
  const [isEmailSending, setIsEmailSending] = useState(false);
  // 비밀번호 일치 검증
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  //킬때마다 초기화
  useEffect(() => {
    if (isOpen) {
      // 폼 데이터 초기화
      setFormData({
        email: "",
        verificationCode: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        age: "",
        gender: "male",
      });

      // 비밀번호 보기 상태 초기화
      setShowPassword(false);
      setShowConfirmPassword(false);

      // 타이머 관련 초기화
      setTimeLeft(0);
      setIsTimerRunning(false);

      // 이메일 인증 관련 초기화
      setIsEmailVerified(false);
      setShowVerification(false);
      // 닉네임 검증상태 초기화
      setIsNicknameVerified(false);
      // 비밀번호 검증 상태 초기화
      setPasswordValidation({
        hasMinLength: false,
        hasMaxLength: true,
        hasEnglish: false,
        hasNumber: false,
        hasSpecialChar: false,
        hasAllRequired: false,
      });

      // 비밀번호 일치 검증 초기화
      setPasswordMatch(true);

      setEmailVerificationToken("");

      setIsAgreed(false);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;

    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }

    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  // 비밀번호 검증 함수
  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasMaxLength = password.length <= 20;
    const hasEnglish = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasAllRequired = hasEnglish && hasNumber && hasSpecialChar;

    return {
      hasMinLength,
      hasMaxLength,
      hasEnglish,
      hasNumber,
      hasSpecialChar,

      hasAllRequired,
    };
  };

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 비밀번호 검증
    if (field === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }

    // 비밀번호 재입력 검증
    if (
      field === "confirmPassword" ||
      (field === "password" && formData.confirmPassword)
    ) {
      const passwordToCheck = field === "password" ? value : formData.password;
      const confirmPasswordToCheck =
        field === "confirmPassword" ? value : formData.confirmPassword;
      setPasswordMatch(passwordToCheck === confirmPasswordToCheck);
    }

    if (field === "nickname" && isNicknameVerified) {
      setIsNicknameVerified(false);
    }
  };

  const sendEmail = async () => {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      WarningToast("올바른 이메일 형식을 입력해주세요.");
      return;
    }
    setIsEmailSending(true);
    try {
      const response = await fetch(`${BASE_URL}/api/auth/email/verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          purpose: "SIGN_UP",
        }),
      });

      if (!response.ok) {
        throw new Error("이메일 전송 실패");
      }

      const data = await response.json();
      console.log("서버 응답:", data);
      console.log("서버 응답:", data);
      console.log("message 값:", data.message);
      console.log("message 타입:", typeof data.message);
      console.log("verificationSent 값:", data.verificationSent);

      if (data.verificationSent === true) {
        SuccessToast("인증번호가 이메일로 전송되었습니다!");
        setTimeLeft(300);
        setIsTimerRunning(true);
        setShowVerification(true);
      } else if (data.message === "Email already in use") {
        ErrorToast("이미 사용중인 이메일입니다.");
      } else if (data.message === "Email not found") {
        ErrorToast("이메일을 찾을 수 없습니다.");
      } else {
        ErrorToast(data.message || "발송 실패");
      }
    } catch (error) {
      console.error("에러 발생:", error);
      ErrorToast("이메일 전송에 실패했습니다. 다시 시도해주세요");
    } finally {
      setIsEmailSending(false);
    }
  };
  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/email/verification/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            verificationCode: formData.verificationCode,
            purpose: "SIGN_UP",
          }),
        },
      );

      const data = await response.json();
      console.log("서버 응답:", data);

      if (data.emailVerified) {
        SuccessToast("인증 성공!");
        setIsEmailVerified(true);
        setIsTimerRunning(false);
        setEmailVerificationToken(data.token);
      } else {
        if (data.message === "Verification request not found or expired") {
          ErrorToast("만료된 인증번호 : 다시 인증번호를 발송해주세요");
        } else if (data.message === "Invalid verification code") {
          ErrorToast("인증번호가 일치하지 않습니다.");
        } else {
          ErrorToast(data.message || "인증 실패");
        }
      }
    } catch (error) {
      console.error("에러 발생:", error);
      ErrorToast("오류 발생 : 잘못된 인증번호 형식일 수 있습니다");
    }
  };

  const verifyNickname = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/register/nickname/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nickname: formData.nickname,
          }),
        },
      );
      const data = await response.json();
      console.log("서버 응답:", data);
      if (formData.nickname === "") {
        WarningToast("입력된 값이 없습니다.");
      } else if (data.nicknameAvailable) {
        SuccessToast("사용 가능한 닉네임입니다.");
        setIsNicknameVerified(true);
      } else {
        ErrorToast("이미 존재하는 닉네임입니다.");
      }
    } catch (error) {
      console.error("에러 발생:", error);
      ErrorToast("오류. 나중에 다시 시도해주세요.");
    }
  };

  const handleRegisterAndLogin = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 이메일 인증 토큰을 Authorization 헤더에 포함
      if (emailVerificationToken) {
        console.log("토큰전송 :", emailVerificationToken);
        headers["Authorization"] = `Bearer ${emailVerificationToken}`;
      }

      const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname,
          gender: formData.gender === "male" ? 0 : 1,
          age: Number(formData.age),
        }),
      });

      const registerData = await registerResponse.json();
      console.log("회원가입 응답:", registerData);
      console.log(registerData.isRegistered, registerData.message);

      if (
        registerData.registered === true ||
        registerData.message === "User registered successfully"
      ) {
        SuccessToast("회원가입이 완료되었습니다!");

        // 2. 회원가입 성공 시 로그인 시도
        const loginResult = await login(formData.email, formData.password);

        // 로그인 성공 콜백 처리
        if (onLoginSuccess) {
          onLoginSuccess(loginResult);
        }

        // 모달 닫기
        onClose();

        // 테마 선택 창 열기 (추가된 부분)
        if (onThemeOpen) {
          onThemeOpen();
        }
      } else if (registerData.message === "Invalid token") {
        ErrorToast("토큰 오류, 회원가입 실패. 다시 시도해주세요");
      } else {
        ErrorToast("회원가입 실패. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("회원가입 또는 로그인 중 오류:", error);
      ErrorToast("오류 발생. 다시 시도해주세요.");
      // 폼 데이터 초기화
      setFormData({
        email: "",
        verificationCode: "",
        password: "",
        confirmPassword: "",
        nickname: "",
        age: "",
        gender: "male",
      });

      // 비밀번호 보기 상태 초기화
      setShowPassword(false);
      setShowConfirmPassword(false);

      // 타이머 관련 초기화
      setTimeLeft(0);
      setIsTimerRunning(false);

      // 이메일 인증 관련 초기화
      setIsEmailVerified(false);
      setShowVerification(false);
      // 닉네임 검증상태 초기화
      setIsNicknameVerified(false);
      // 비밀번호 검증 상태 초기화
      setPasswordValidation({
        hasMinLength: false,
        hasMaxLength: true,
        hasEnglish: false,
        hasNumber: false,
        hasSpecialChar: false,

        hasAllRequired: false,
      });

      // 비밀번호 일치 검증 초기화
      setPasswordMatch(true);

      setEmailVerificationToken("");
    }
  };

  // 회원가입 버튼 활성화 조건
  const isSignupDisabled =
    !formData.age ||
    !formData.nickname ||
    !isEmailVerified ||
    !isNicknameVerified ||
    !passwordValidation.hasMinLength ||
    !passwordValidation.hasMaxLength ||
    !passwordValidation.hasAllRequired ||
    !passwordMatch ||
    !isAgreed;
  // 비밀번호 재입력 필드 활성화 조건
  const isConfirmPasswordDisabled =
    !passwordValidation.hasMinLength ||
    !passwordValidation.hasMaxLength ||
    !passwordValidation.hasAllRequired;

  const ValidationItem = ({ isValid, text, isError = false }) => (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X
          className={`w-4 h-4 ${isError ? "text-red-500" : "text-gray-400"}`}
        />
      )}
      <span
        className={
          isValid
            ? "text-green-600"
            : isError
              ? "text-red-600"
              : "text-gray-500"
        }
      >
        {text}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-pretendard">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 relative max-h-[90vh] overflow-y-auto"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>

        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          회원가입
        </h1>

        <div className="space-y-4">
          {/* 이메일 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEmailVerified ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                disabled={isEmailVerified}
              />
              <button
                type="button"
                className={`w-24 py-2 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${isEmailVerified
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-main hover:bg-blue-700"
                  }`}
                onClick={sendEmail}
                disabled={isEmailVerified}
              >
                {isEmailVerified ? (
                  "인증완료"
                ) : isEmailSending ? (
                  <div className="flex flex-row justify-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.3s]" />
                    <div className="w-2 h-2 rounded-full bg-white animate-bounce [animation-delay:.7s]" />
                  </div>
                ) : (
                  "인증번호발송"
                )}
              </button>
            </div>
          </div>
          {/* 인증번호 입력 */}
          {showVerification && !isEmailVerified && (
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="인증번호 입력"
                  value={formData.verificationCode}
                  onChange={(e) =>
                    handleInputChange("verificationCode", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="w-24 py-2 bg-main hover:bg-blue-700 text-white text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={verifyEmail}
                >
                  입력
                </button>
              </div>
              <p className="text-sm text-start text-gray-500 mt-1">
                남은 시간: {formatTime(timeLeft)}
              </p>
            </div>
          )}
          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="w-full px-3 py-2 pr-12 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-600 cursor-pointer select-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
              </button>
            </div>

            {/* 비밀번호 검증 UI */}
            {formData.password && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <ValidationItem
                  isValid={passwordValidation.hasMinLength}
                  text="최소 8자"
                />
                <ValidationItem
                  isValid={
                    passwordValidation.hasEnglish &&
                    passwordValidation.hasNumber &&
                    passwordValidation.hasSpecialChar
                  }
                  text="영문, 숫자, 특수문자 3가지 조합"
                />

                {/* 에러 메시지 */}
                {!passwordValidation.hasMinLength && (
                  <div className="text-red-600 text-sm mt-2">
                    최소 8글자 이상 작성해야합니다
                  </div>
                )}
                {!passwordValidation.hasMaxLength && (
                  <div className="text-red-600 text-sm mt-2">
                    최대 20글자까지 작성할 수 있습니다
                  </div>
                )}

                {!passwordValidation.hasAllRequired &&
                  passwordValidation.hasMinLength && (
                    <div className="text-red-600 text-sm mt-2">
                      영어, 숫자, 특수문자 모두 포함해서 작성해주십시오
                    </div>
                  )}
              </div>
            )}
          </div>
          {/* 비밀번호 재입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
              비밀번호 재입력
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full px-3 py-2 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isConfirmPasswordDisabled
                  ? "bg-gray-100 cursor-not-allowed border-gray-300"
                  : "border-gray-300"
                  }`}
                disabled={isConfirmPasswordDisabled}
              />
              <button
                className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-600 cursor-pointer select-none"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isConfirmPasswordDisabled}
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEye : faEyeSlash}
                />
              </button>
            </div>

            {/* 비밀번호 불일치 메시지 */}
            {formData.confirmPassword && !passwordMatch && (
              <div className="text-red-600 text-sm mt-2">
                비밀번호가 일치하지 않습니다
              </div>
            )}
          </div>
          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
              닉네임
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                disabled={isNicknameVerified}
                className={`w-24 py-2 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${isNicknameVerified
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-main"
                  }`}
                onClick={verifyNickname}
              >
                {isNicknameVerified ? "확인완료" : "중복확인"}
              </button>
            </div>
          </div>
          {/* 나이와 성별 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
                나이
              </label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "" || value === "0") {
                    handleInputChange("age", "");
                    return;
                  }

                  if (/^\d+$/.test(value)) {
                    handleInputChange("age", value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-left pl-2">
                성별
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange("gender", "male")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${formData.gender === "male"
                    ? "bg-main text-white border-main"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                >
                  남
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("gender", "female")}
                  className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${formData.gender === "female"
                    ? "bg-main text-white border-main"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                >
                  여
                </button>
              </div>
            </div>
          </div>
          {/* 개인정보 수집·이용 동의 */}
          <div className="flex items-center pl-2">
            <input
              id="privacy-agreement"
              type="checkbox"
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="privacy-agreement"
              className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
            >
              <span
                className="underline text-blue-600 hover:text-blue-800"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPrivacyModal(true);
                }}
              >
                개인정보 수집 및 이용
              </span>
              에 동의합니다 <span className="text-red-500">(필수)</span>
            </label>
          </div>

          {/* 개인정보 동의서 모달 */}
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
                  개인정보 수집·이용 동의
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
          {/* 회원가입 버튼 */}
          <button
            type="button"
            className={`w-full py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6 ${isSignupDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-main text-white hover:bg-blue-700"
              }`}
            disabled={isSignupDisabled}
            onClick={handleRegisterAndLogin}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
