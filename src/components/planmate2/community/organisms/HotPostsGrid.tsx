import { HotPostCard } from '../molecules/HotPostCard';

interface HotPostsGridProps {
  hotPosts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostsGrid = ({ hotPosts, type, onNavigate }: HotPostsGridProps) => {
  return (
    <section className="mb-4 md:mb-7" aria-labelledby="hot-posts-heading">
      <h2 id="hot-posts-heading" className="sr-only">지금 뜨는 글</h2>
      <div className="-mx-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:snap-none md:grid-cols-3 md:items-start md:gap-3 md:overflow-visible md:px-0 md:pb-0">
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
