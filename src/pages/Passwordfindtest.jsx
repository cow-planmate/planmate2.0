import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-pretendard">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">비밀번호 찾기</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-24 py-3 bg-main text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                인증번호발송
              </button>
            </div>
          </div>

          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="2 : 26"
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="w-24 py-3 bg-main text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                입력
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">인증번호 재발송</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
