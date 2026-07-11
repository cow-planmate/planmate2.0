import { TrendingUp } from 'lucide-react';
import { HotPostCard } from '../molecules/HotPostCard';

interface HotPostsGridProps {
  hotPosts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostsGrid = ({ hotPosts, type, onNavigate }: HotPostsGridProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="font-bold text-[#1a1a1a]">지금 뜨는 핫글</h2>
            <p className="text-[10px] text-gray-400 font-medium">실시간 가장 반응이 뜨거운 게시글입니다</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-gray-400 hover:text-red-500 cursor-pointer transition-colors">전체보기</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hotPosts.map((post, index) => (
          <HotPostCard 
            key={post.id}
            post={post}
            index={index}
            type={type}
            onClick={() => onNavigate(type === 'recommend' ? 'recommend-detail' : 'detail', { post: { ...post, category: type } })}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
};
