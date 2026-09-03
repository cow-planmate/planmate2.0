interface NavigationTabsProps {
  currentType: string;
  onNavigate: (view: any, data?: any) => void;
}

export const NavigationTabs = ({ currentType, onNavigate }: NavigationTabsProps) => {
  const tabs = [
    { id: 'free', label: '자유게시판' },
    { id: 'qna', label: '질문게시판' },
    { id: 'recommend', label: '장소 추천' },
  ];

  return (
    // 모바일에서 탭 4개가 한 화면에 안 들어가므로 가로 스크롤 + 스크롤바 숨김
    <div className="mb-6 flex overflow-x-auto border-b border-[#d9dce2] no-scrollbar sm:mb-7">
      {tabs.map((tab) => {
        const isActive = currentType === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate('board-list', { boardType: tab.id })}
            className={`shrink-0 border-b-2 px-5 py-4 text-[16px] font-bold transition-colors whitespace-nowrap ${
              isActive
                ? 'border-[#1344FF] text-[#1344FF]'
                : 'border-transparent text-[#666666] hover:text-[#1a1a1a] hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
