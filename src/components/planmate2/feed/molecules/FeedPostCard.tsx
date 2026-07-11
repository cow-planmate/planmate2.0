import { Clock, Copy, Eye, MapPin, MessageCircle, Shield, ThumbsUp } from 'lucide-react';
import React from 'react';
import { TravelPost } from '../../../../types/planmate2';
import { StatItem } from '../atoms/StatItem';
import { TagBadge } from '../atoms/TagBadge';

interface FeedPostCardProps {
  post: TravelPost;
  onClick: (post: TravelPost) => void;
  onNavigate?: (view: any, data?: any) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({ post, onClick, onNavigate }) => {
  return (
    <div
      onClick={() => onClick(post)}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden border border-gray-100"
    >
      {/* Cover Image */}
      <div className="relative h-40 bg-gray-100">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        {post.verified && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm">
            <Shield className="w-3 h-3" />
            인증
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {post.tags.slice(0, 2).map((tag: string) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-gray-900 mb-0.5 line-clamp-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              <div className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-[#1344FF]" />
                <span>{post.location}</span>
              </div>
              <div className="flex items-center gap-0.5 ml-1">
                <Clock className="w-3 h-3" />
                <span>{post.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Author */}
        <div 
          className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-50 hover:opacity-70 transition-opacity"
          onClick={(e) => {
            if (onNavigate) {
              e.stopPropagation();
              onNavigate('mypage', { userId: post.userId });
            }
          }}
        >
          <div className="w-5 h-5 bg-blue-50 rounded-full flex items-center justify-center text-[#1344FF] font-bold text-[10px]">
            {post.author[0]}
          </div>
          <span className="text-[11px] text-gray-600 font-bold">{post.author}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <StatItem icon={ThumbsUp} value={post.likeCount} highlight />
          <StatItem icon={MessageCircle} value={post.commentCount} />
          <StatItem icon={Eye} value={post.viewCount} />
          <StatItem icon={Copy} value={post.forkCount} />
          <span className="ml-auto text-gray-400">
            {post.createdAt}
          </span>
        </div>
      </div>
    </div>
  );
};
