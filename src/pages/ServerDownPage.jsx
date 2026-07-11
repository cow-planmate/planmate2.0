const ServerDownPage = () => {
  return (
    <div className="font-pretendard fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 text-center w-[320px]">
        <h1 className="text-2xl font-bold mb-3">🚧 서버 연결 오류</h1>
        <p className="text-gray-600 mb-6">
          서버가 응답하지 않습니다.<br />
          일시적인 오류이거나 서버 점검이 진행 중일 수 있습니다.<br />
          잠시 후 다시 시도해주세요.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="w-full py-2 bg-main hover:bg-mainDark text-white rounded-lg"
        >
          새로고침
        </button>
      </div>
    </div>
  );
};

export default ServerDownPage;
