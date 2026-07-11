import React from 'react';
import { TravelPost } from '../../../../types/planmate2';
import { FeedPostCard } from '../molecules/FeedPostCard';

interface PostsGridProps {
  posts: TravelPost[];
  onViewPost: (post: TravelPost) => void;
  onNavigate: (view: any, data?: any) => void;
}

export const PostsGrid: React.FC<PostsGridProps> = ({ posts, onViewPost, onNavigate }) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">해당하는 여행 계획이 없습니다</p>
        <p className="text-gray-400 text-sm mt-2">다른 태그나 검색어를 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map((post) => (
        <FeedPostCard 
          key={post.id} 
          post={post} 
          onClick={onViewPost} 
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
};
