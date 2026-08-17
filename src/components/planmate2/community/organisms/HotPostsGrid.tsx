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
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-red-500" />
          </div>
          <h2 className="text-[20px] font-bold text-[#1a1a1a]">지금 뜨는 핫글</h2>
        </div>
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
