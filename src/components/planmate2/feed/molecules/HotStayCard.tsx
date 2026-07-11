import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import React from 'react';
import { TravelPost } from '../../../../types/planmate2';

interface HotStayCardProps {
  post: TravelPost;
  rank: number;
  onClick: (post: TravelPost) => void;
}

export const HotStayCard: React.FC<HotStayCardProps> = ({ post, rank, onClick }) => {
  return (
    <div 
      onClick={() => onClick(post)}
      className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-100 hover:border-red-100 hover:bg-red-50/10 transition-all cursor-pointer group"
    >
      <div className="relative w-24 h-24 shrink-0 rounded-lg overflow-hidden">
        <img 
          src={post.coverImage} 
          alt={post.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-md text-white w-6 h-6 flex items-center justify-center rounded text-xs font-bold">
          {rank}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-bold text-[#1344FF] bg-blue-50 px-1.5 py-0.5 rounded">{post.location}</span>
          <span className="text-[10px] text-gray-400 font-medium">{post.duration}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1 group-hover:text-red-500 transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <Eye className="w-3.5 h-3.5" />
            {post.viewCount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#1344FF] font-bold">
            <ThumbsUp className="w-3.5 h-3.5" />
            {post.likeCount}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
            <MessageCircle className="w-3.5 h-3.5" />
            {post.commentCount}
          </div>
        </div>
      </div>
    </div>
  );
};
