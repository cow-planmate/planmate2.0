import React, { useState } from "react";

function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [gender, setGender] = useState("male"); // 'male' or 'female'

  return (
    <div className="font-pretendard min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            회원가입
          </h1>

          <div className="space-y-4">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="honggildong@planmate.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="w-24 py-2 bg-main text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  인증번호발송
                </button>
              </div>
            </div>

            {/* 인증번호 입력 */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="2:26"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="w-24 py-2 bg-main text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  입력
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">인증번호 재발송</p>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="inline-flex items-center mt-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                비밀번호 보기
              </label>
            </div>

            {/* 비밀번호 재입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 재입력
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="inline-flex items-center mt-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={showConfirmPassword}
                  onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                />
                비밀번호 보기
              </label>
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="홍길동"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  className="w-24 py-2 bg-main text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                >
                  중복확인
                </button>
              </div>
            </div>

            {/* 나이와 성별 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  나이
                </label>
                <input
                  type="number"
                  placeholder="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성별
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("male")}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                      gender === "male"
                        ? "bg-main text-white border-main"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    남
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("female")}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-colors ${
                      gender === "female"
                        ? "bg-main text-white border-main"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    녀
                  </button>
                </div>
              </div>
            </div>

            {/* 회원가입 버튼 */}
            <button
              type="button"
              className="w-full py-3 bg-main text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-6"
            >
              회원가입
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
