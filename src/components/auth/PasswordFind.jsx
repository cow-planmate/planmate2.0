import { useState, useEffect } from "react";
import { ErrorToast, SuccessToast, WarningToast } from "../common/Toast";
export default function PasswordFind({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    email: "",
    verificationCode: "",
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState("");
  const [isEmailSending, setIsEmailSending] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_URL;

  //킬때마다 초기화
  useEffect(() => {
    if (isOpen) {
      // 폼 데이터 초기화
      setFormData({
        email: "",
        verificationCode: "",
      });
      // 타이머 관련 초기화
      setTimeLeft(0);

      // 이메일 인증 관련 초기화
      setIsEmailVerified(false);
      setShowVerification(false);
      setEmailVerificationToken("");
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;

    if (timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft]);

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
          purpose: "RESET_PASSWORD",
        }),
      });

      if (!response.ok) {
        throw new Error("이메일 전송 실패");
      }

      const data = await response.json();
      console.log("서버 응답:", data);
      if (data.verificationSent) {
        SuccessToast("인증번호가 전송되었습니다.");
        setTimeLeft(300);
        setShowVerification(true); // 인증번호 입력 영역 표시
      } else if (data.message === "Email not found") {
        ErrorToast("이메일을 찾을 수 없습니다.");
      } else {
        ErrorToast(data.message || "발송 실패");
      }
    } catch (error) {
      console.error("에러 발생:", error);
      ErrorToast("이메일 전송에 실패했습니다.");
    } finally {
      setIsEmailSending(false); // 로딩 종료
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
            purpose: "RESET_PASSWORD",
          }),
        },
      );

      const data = await response.json();
      console.log("서버 응답:", data);

      if (
        data.emailVerified ||
        data.message === "Verification completed successfully"
      ) {
        SuccessToast("인증 성공!");
        setIsEmailVerified(true); // 인증 완료 상태로 변경
        setEmailVerificationToken(data.token);
      } else {
        if (data.message === "Email already in use") {
          ErrorToast("이미 사용중인 이메일입니다.");
        } else if (
          data.message === "Verification request not found or expired"
        ) {
          ErrorToast("만료된 인증번호 : 다시 인증번호를 발송해주세요");
        } else if (data.message === "Invalid verification code") {
          ErrorToast("인증번호가 일치하지 않습니다.");
        } else {
          ErrorToast(data.message || "인증 실패");
        }
      }
    } catch (error) {
      console.error("에러 발생:", error);
      ErrorToast("서버 오류. 나중에 다시 시도해주세요.");
    }
  };

  const sendTempPassword = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // 이메일 인증 토큰을 Authorization 헤더에 포함
      if (emailVerificationToken) {
        headers["Authorization"] = `Bearer ${emailVerificationToken}`;
      }

      const response = await fetch(`${BASE_URL}/api/auth/password/email`, {
        method: "POST",
        headers: headers,
      });

      if (!response.ok) {
        throw new Error("임시 비밀번호 발송 실패");
      }

      const data = await response.json();

      if (data.message === "Temp password sent" || data.message === "임시 비밀번호를 전송했습니다") {
        SuccessToast(
          data.message || "임시 비밀번호가 이메일로 발송되었습니다. 로그인 후 마이페이지에서 변경해주세요",
        );
        onClose();
      } else {
        ErrorToast(data.message || "발송 실패 다시시도해주세요");
        setFormData({
          email: "",
          verificationCode: "",
        });
        // 타이머 관련 초기화
        setTimeLeft(0);

        // 이메일 인증 관련 초기화
        setIsEmailVerified(false);
        setShowVerification(false);
        setEmailVerificationToken("");
      }
    } catch (err) {
      console.log(err);
      ErrorToast("오류 발생 다시시도 해주세요");
      setFormData({
        email: "",
        verificationCode: "",
      });
      // 타이머 관련 초기화
      setTimeLeft(0);

      // 이메일 인증 관련 초기화
      setIsEmailVerified(false);
      setShowVerification(false);
      setEmailVerificationToken("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-pretendard">
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">비밀번호 찾기</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`min-w-0 flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isEmailVerified ? "bg-gray-100 cursor-not-allowed" : ""
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
        </div>
        <button
          type="button"
          className={`w-full py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6 ${isEmailVerified
            ? "bg-main text-white hover:bg-blue-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          onClick={sendTempPassword}
          disabled={!isEmailVerified}
        >
          임시비밀번호발송
        </button>
      </div>
    </div>
  );
}
