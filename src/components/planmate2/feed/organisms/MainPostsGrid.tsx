import { Search } from 'lucide-react';
import React from 'react';
import { CompactPostCard } from '../molecules/CompactPostCard';
import { MainFeedPostCard } from '../molecules/MainFeedPostCard';

interface MainPostsGridProps {
  posts: any[];
  viewMode: 'grid' | 'list';
  onNavigate: (view: any, data?: any) => void;
  likedPosts: Set<number>;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onClearFilters: () => void;
}

export const MainPostsGrid: React.FC<MainPostsGridProps> = ({
  posts,
  viewMode,
  onNavigate,
  likedPosts,
  onLike,
  onClearFilters
}) => {
  if (posts.length === 0) {
    return (
      <div className="col-span-full bg-white rounded-2xl border border-[#ececf0] p-12 text-center">
        <Search className="w-14 h-14 text-[#e5e7eb] mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#111318] mb-1.5">조건에 맞는 여행기가 없어요</h3>
        <p className="text-sm text-[#6b7280] mb-6">검색어를 바꾸거나 필터를 풀어보세요</p>
        <button
          onClick={onClearFilters}
          className="bg-[#1344FF] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#0d34cc] transition-all"
        >
          필터 초기화
        </button>
      </div>
    );
  }

  return (
    <div className={`h-fit ${viewMode === 'list' ? 'flex flex-col' : 'grid grid-cols-1 sm:grid-cols-2 gap-5'}`}>
      {posts.map(post => (
        viewMode === 'grid' ? (
          <MainFeedPostCard
            key={post.id}
            post={post}
            onNavigate={onNavigate}
            liked={likedPosts.has(post.id)}
            onLike={onLike}
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
