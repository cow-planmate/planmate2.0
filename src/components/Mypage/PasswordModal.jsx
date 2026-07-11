import { useState } from "react";
import { useApiClient } from "../../hooks/useApiClient";

import { Check, X } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { ErrorToast, SuccessToast } from "../common/Toast";

const PasswordModal = ({ setIsPasswordOpen }) => {
  const { post, patch, isAuthenticated } = useApiClient();

  const [prevPassword, setPrevPassword] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const [showPrev, setShowPrev] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRe, setShowRe] = useState(false);

  const [wrongPrev, setWrongPrev] = useState(false);
  const [wrongRe, setWrongRe] = useState(false);
  const [wrongSame, setWrongSame] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasMaxLength: true,
    hasEnglish: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasAllRequired: false,
  });

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

  const handleInputChange = (field, value) => {
    if (field === "password") {
      setPassword(value);
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const passwordChange = async () => {
    setWrongPrev(false);
    setWrongSame(false);
    setWrongRe(false);
    const BASE_URL = import.meta.env.VITE_API_URL;

    if (!isAuthenticated()) return;

    if (
      !passwordValidation.hasMinLength ||
      !passwordValidation.hasMaxLength ||
      !passwordValidation.hasAllRequired
    ) {
      ErrorToast("비밀번호 조건을 만족하지 않습니다.");
      return;
    }

    if (password == prevPassword) {
      setWrongSame(true);
      return;
    }

    if (password !== rePassword) {
      setWrongRe(true);
      return;
    }

    if (!prevPassword) {
      setWrongPrev(true);
      return;
    }

    setIsLoading(true);

    try {
      const passwordChanged = await patch(`${BASE_URL}/api/auth/password`, {
        currentPassword: prevPassword,
        newPassword: password,
        confirmPassword: rePassword,
      });

      console.log(passwordChanged)

      SuccessToast("비밀번호가 변경되었습니다!");
      setIsPasswordOpen(false);
    } catch (err) {
      console.error("비밀번호 변경 오류:", err);
      ErrorToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6">비밀번호 변경</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              현재 비밀번호
            </p>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                type={showPrev ? "text" : "password"}
                placeholder="현재 비밀번호를 입력하세요"
                onChange={(e) => setPrevPassword(e.target.value)}
              />
              <button
                onClick={() => setShowPrev((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FontAwesomeIcon
                  icon={showPrev ? faEye : faEyeSlash}
                  className="w-4 h-4"
                />
              </button>
            </div>
            {wrongPrev && (
              <span className="text-red-500 text-sm mt-1 block">
                현재 비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              새 비밀번호
            </p>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                type={showNew ? "text" : "password"}
                placeholder="새 비밀번호를 입력하세요"
                value={password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              <button
                onClick={() => setShowNew((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FontAwesomeIcon
                  icon={showNew ? faEye : faEyeSlash}
                  className="w-4 h-4"
                />
              </button>
            </div>

            {password && password.length > 0 && (
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

                {!passwordValidation.hasMinLength && (
                  <div className="text-red-600 text-sm mt-2">
                    최소 8글자 이상 작성해야합니다.
                  </div>
                )}
                {!passwordValidation.hasMaxLength && (
                  <div className="text-red-600 text-sm mt-2">
                    최대 20글자까지 작성할 수 있습니다.
                  </div>
                )}

                {!passwordValidation.hasAllRequired &&
                  passwordValidation.hasMinLength && (
                    <div className="text-red-600 text-sm mt-2">
                      영어, 숫자, 특수문자 모두 포함해서 작성해주십시오.
                    </div>
                  )}
              </div>
            )}

            {wrongSame && (
              <span className="text-red-500 text-sm mt-1 block">
                현재 비밀번호와 새 비밀번호가 동일합니다.
              </span>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              비밀번호 재입력
            </p>
            <div className="relative">
              <input
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all duration-200"
                type={showRe ? "text" : "password"}
                placeholder="비밀번호를 다시 입력하세요"
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
              />
              <button
                onClick={() => setShowRe((prev) => !prev)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <FontAwesomeIcon
                  icon={showRe ? faEye : faEyeSlash}
                  className="w-4 h-4"
                />
              </button>
            </div>
            {wrongRe && (
              <span className="text-red-500 text-sm mt-1 block">
                비밀번호가 일치하지 않습니다.
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => setIsPasswordOpen(false)}
            disabled={isLoading}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            취소
          </button>
          <button
            onClick={() => passwordChange()}
            disabled={isLoading}
            className="px-4 py-2.5 bg-main hover:bg-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[70px]"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;