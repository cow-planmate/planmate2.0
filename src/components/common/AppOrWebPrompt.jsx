import React, { useState } from 'react';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.planmate.planmate';
const CHOICE_KEY = 'planmate:appOrWebChoice';

const isAndroidMobileBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // 앱 안의 웹뷰(wv)에서는 묻지 않는다
  return /Android/i.test(ua) && /Mobile/i.test(ua) && !/; wv\)/.test(ua);
};

const hasChosen = () => {
  try {
    return localStorage.getItem(CHOICE_KEY) !== null;
  } catch {
    return true;
  }
};

export default function AppOrWebPrompt() {
  const [open, setOpen] = useState(() => isAndroidMobileBrowser() && !hasChosen());

  if (!open) return null;

  const choose = (choice) => {
    try {
      localStorage.setItem(CHOICE_KEY, choice);
    } catch {
      // 저장이 막혀 있으면 다음 방문에 다시 묻는다
    }
    setOpen(false);
    if (choice === 'app') window.location.href = PLAY_STORE_URL;
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center bg-black/40 font-pretendard">
      <div className="w-full bg-white rounded-t-2xl shadow-lg p-6 pb-8 break-keep">
        <div className="flex items-center gap-4">
          <img src="/app-icon.png" alt="PlanMate 앱 아이콘" className="w-16 h-16 rounded-2xl shadow" />
          <div>
            <div className="text-lg font-bold text-gray-800">PlanMate를 어떻게 이용할까요?</div>
            <p className="mt-1 text-sm text-gray-500">
              플레이스토어에 앱이 출시되었어요. 앱으로 더 편하게 여행을 계획해 보세요.
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => choose('app')}
            className="w-full py-3 rounded-lg bg-main text-white text-base font-medium"
          >
            앱으로 하기
          </button>
          <button
            onClick={() => choose('web')}
            className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 text-base font-medium"
          >
            웹으로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
