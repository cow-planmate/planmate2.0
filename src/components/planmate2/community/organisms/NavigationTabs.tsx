import { HelpCircle, MapPin, MessageSquare, Users } from 'lucide-react';

interface NavigationTabsProps {
  currentType: string;
  onNavigate: (view: any, data?: any) => void;
}

export const NavigationTabs = ({ currentType, onNavigate }: NavigationTabsProps) => {
  const tabs = [
    { id: 'free', label: '자유게시판', icon: MessageSquare },
    { id: 'qna', label: 'Q&A', icon: HelpCircle },
    { id: 'mate', label: '메이트 찾기', icon: Users },
    { id: 'recommend', label: '장소 추천', icon: MapPin },
  ];

  return (
    <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentType === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate('board-list', { boardType: tab.id })}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'border-[#1344FF] text-[#1344FF]'
                : 'border-transparent text-[#666666] hover:text-[#1a1a1a] hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
