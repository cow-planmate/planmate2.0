import { PlusCircle } from 'lucide-react';
import React from 'react';

interface MainFeedHeaderProps {
  onNavigate: (view: any, data?: any) => void;
  isAuthenticated: boolean;
}

export const MainFeedHeader: React.FC<MainFeedHeaderProps> = ({ onNavigate, isAuthenticated }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2 break-keep">
          가져가는 여행기
        </h1>
        <p className="text-sm sm:text-base text-[#666666] break-keep">
          읽는 여행기가 아니라, 가져가는 여행기. 마음에 드는 일정을 가져가고 나만의 여행으로 만들어보세요.
        </p>
      </div>
      {isAuthenticated && (
        <button
          onClick={() => onNavigate('create')}
          className="flex items-center justify-center gap-2 bg-[#1344FF] text-white px-6 py-3 rounded-xl hover:bg-[#0d34cc] transition-all shadow-md font-bold whitespace-nowrap shrink-0"
        >
          <PlusCircle className="w-5 h-5 shrink-0" />
          피드 생성하기
        </button>
      )}
    </div>
  );
};
