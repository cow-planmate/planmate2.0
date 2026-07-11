import React from "react";
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-pretendard">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
          로그인
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col items-center">
            <button className=" w-[6rem] py-3 bg-main text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              로그인
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-8 text-sm text-gray-500">
          <button className="hover:text-gray-700">비밀번호 찾기</button>
          <button className="hover:text-gray-700">회원가입</button>
        </div>
      </div>
    </div>
  );
}
export default App;
