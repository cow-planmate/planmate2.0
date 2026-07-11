import React from 'react';

const Maintenance = () => {
  const day = import.meta.env.VITE_MAINTENANCE_DAY;
  const content = import.meta.env.VITE_MAINTENANCE_CONTENT;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 font-pretendard">
      <div className="max-w-md w-full text-center">
        {/* 아이콘 컨테이너 */}
        <div className="mb-8 flex justify-center">
          <div className="bg-main/10 p-5 rounded-full">
            <svg
              className="w-16 h-16 text-main"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* 안내 문구 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">서비스 점검 안내</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          더 나은 서비스를 제공하기 위해 임시 점검이 진행되고 있습니다.<br />
          이용에 불편을 드려 죄송합니다.
        </p>

        {/* 점검 상세 정보 박스 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 text-left">
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-gray-900 min-w-[60px]">점검 일시</span>
            <span className="text-gray-600 font-medium">{day}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <span className="font-semibold text-gray-900 min-w-[60px]">점검 내용</span>
            <span className="text-gray-600">{content}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
