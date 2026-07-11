import { Search } from 'lucide-react';
import React from 'react';
import { CompactPostCard } from '../molecules/CompactPostCard';
import { MainFeedPostCard } from '../molecules/MainFeedPostCard';

interface MainPostsGridProps {
  posts: any[];
  viewMode: 'grid' | 'list';
  onNavigate: (view: any, data?: any) => void;
  likedPosts: Set<number>;
  dislikedPosts: Set<number>;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onDislike: (postId: number, e: React.MouseEvent) => void;
  onClearFilters: () => void;
}

export const MainPostsGrid: React.FC<MainPostsGridProps> = ({
  posts,
  viewMode,
  onNavigate,
  likedPosts,
  dislikedPosts,
  onLike,
  onDislike,
  onClearFilters
}) => {
  if (posts.length === 0) {
    return (
      <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
        <Search className="w-16 h-16 text-[#e5e7eb] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">검색 결과가 없습니다</h3>
        <p className="text-[#666666] mb-6">다른 검색어나 필터를 시도해보세요</p>
        <button
          onClick={onClearFilters}
          className="bg-[#1344FF] text-white px-6 py-2 rounded-xl hover:bg-[#0d34cc] transition-all"
        >
          필터 초기화
        </button>
      </div>
    );
  }

  return (
    <div className={`lg:col-span-2 h-fit ${viewMode === 'list' ? 'bg-white rounded-xl shadow-md overflow-hidden flex flex-col' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}`}>
      {posts.map(post => (
        viewMode === 'grid' ? (
          <MainFeedPostCard
            key={post.id}
            post={post}
            onNavigate={onNavigate}
            liked={likedPosts.has(post.id)}
            disliked={dislikedPosts.has(post.id)}
            onLike={onLike}
            onDislike={onDislike}
          />
        ) : (
          <CompactPostCard
            key={post.id}
            post={post}
            onNavigate={onNavigate}
            liked={likedPosts.has(post.id)}
            onLike={onLike}
          />
        )
      ))}
    </div>
  );
};
