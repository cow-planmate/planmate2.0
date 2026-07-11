import { Copy } from 'lucide-react';
import React from 'react';

interface BestPlannerCardProps {
  name: string;
  forkCount: number;
  avatar: string;
  userId?: string;
  onNavigate?: (view: any, data?: any) => void;
}

export const BestPlannerCard: React.FC<BestPlannerCardProps> = ({ name, forkCount, avatar, userId, onNavigate }) => {
  return (
    <div 
      className="flex-shrink-0 bg-white rounded-lg p-3 shadow-sm border border-blue-100 min-w-[140px] cursor-pointer hover:border-[#1344FF] transition-all group"
      onClick={() => onNavigate && userId && onNavigate('mypage', { userId })}
    >
      <div className="flex items-center gap-2.5">
        <div className="text-2xl group-hover:scale-110 transition-transform">{avatar}</div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="font-bold text-xs text-gray-900 group-hover:text-[#1344FF]">{name}</p>
          </div>
          <div className="flex items-center gap-1 text-[#1344FF]">
            <Copy className="w-3 h-3" />
            <p className="text-[10px] font-bold">{forkCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
