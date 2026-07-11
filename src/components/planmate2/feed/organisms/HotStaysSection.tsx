import { TrendingUp } from 'lucide-react';
import React from 'react';
import { TravelPost } from '../../../../types/planmate2';
import { HotStayCard } from '../molecules/HotStayCard';

interface HotStaysSectionProps {
  hotPosts: TravelPost[];
  onViewPost: (post: TravelPost) => void;
}

export const HotStaysSection: React.FC<HotStaysSectionProps> = ({ hotPosts, onViewPost }) => {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-gray-900">실시간 인기 핫스테이</h2>
          <span className="bg-red-50 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">HOT</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotPosts.map((post, index) => (
            <HotStayCard 
              key={post.id} 
              post={post} 
              rank={index + 1} 
              onClick={onViewPost} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};
