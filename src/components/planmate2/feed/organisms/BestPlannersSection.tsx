import { TrendingUp } from 'lucide-react';
import React from 'react';
import { BestPlannerCard } from '../molecules/BestPlannerCard';

interface BestPlannersSectionProps {
  planners: Array<{
    name: string;
    forkCount: number;
    avatar: string;
    userId: string;
  }>;
  onNavigate: (view: any, data?: any) => void;
}

export const BestPlannersSection: React.FC<BestPlannersSectionProps> = ({ planners, onNavigate }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#1344FF]" />
          <h2 className="font-bold text-sm text-gray-900">이번 주 베스트 플래너</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {planners.map((planner) => (
            <BestPlannerCard key={planner.name} {...planner} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
};
