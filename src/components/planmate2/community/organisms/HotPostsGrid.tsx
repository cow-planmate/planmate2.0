import { HotPostCard } from '../molecules/HotPostCard';

interface HotPostsGridProps {
  hotPosts: any[];
  type: string;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostsGrid = ({ hotPosts, type, onNavigate }: HotPostsGridProps) => {
  return (
    <section className="mb-7" aria-labelledby="hot-posts-heading">
      <h2 id="hot-posts-heading" className="sr-only">지금 뜨는 글</h2>
      <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-3">
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
