import { HotPostCard } from '../molecules/HotPostCard';

interface HotPostsGridProps {
  hotPosts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostsGrid = ({ hotPosts, type, onNavigate }: HotPostsGridProps) => {
  return (
    <section className="mb-6 overflow-hidden rounded-[18px] border border-[#d9dce2] bg-white">
      <div className="flex items-center gap-3 border-b border-[#eef0f3] px-5 py-4">
        <h2 className="text-[18px] font-extrabold text-[#111318]">지금 뜨는 글</h2>
        <span className="text-sm text-[#a1a6b0]">최근 24시간</span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-[#e5e7eb] md:grid-cols-3 md:divide-x md:divide-y-0">
        {hotPosts.slice(0, 3).map((post, index) => (
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
    </section>
  );
};
