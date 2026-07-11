import { Clock, Copy, Eye, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';

interface MainFeedPostCardProps {
  post: any;
  onNavigate: (view: any, data?: any) => void;
  liked: boolean;
  disliked: boolean;
  onLike: (postId: number, e: React.MouseEvent) => void;
  onDislike: (postId: number, e: React.MouseEvent) => void;
}

export const MainFeedPostCard: React.FC<MainFeedPostCardProps> = ({
  post,
  onNavigate,
  liked,
  disliked,
  onLike,
  onDislike
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={() => onNavigate('detail', { post })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col"
    >
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#1344FF] shadow-sm z-10">
          {post.destination}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div
          className="flex items-center mb-3 group/author"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('mypage', { userId: post.userId });
          }}
        >
          <img src={post.authorImage} alt={post.author} className="w-8 h-8 rounded-full mr-2 group-hover/author:ring-2 group-hover/author:ring-[#1344FF] transition-all" />
          <div>
            <p className="text-sm font-bold text-[#1a1a1a] leading-none mb-1 group-hover/author:text-[#1344FF] transition-colors">{post.author}</p>
            <p className="text-[11px] text-[#666666]">{post.createdAt}</p>
          </div>
        </div>

        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 line-clamp-1">{post.title}</h3>
        <p className="text-sm text-[#666666] mb-4 line-clamp-2 h-10">{post.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.slice(0, 2).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 bg-[#f0f4ff] text-[#1344FF] text-[11px] font-bold rounded-md">
              {tag}
            </span>
          ))}
          <span className="px-2 py-0.5 bg-[#f8f9fa] text-[#666666] text-[11px] font-medium rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.duration}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#666666] pt-4 border-t border-[#e5e7eb] mt-auto">
          <button
            onClick={(e) => onLike(post.id, e)}
            className="flex items-center gap-1 transition-colors hover:opacity-80"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'text-[#1344FF] fill-[#1344FF]' : 'text-[#1344FF]'}`} />
            <span className="text-[#1344FF] font-bold">{(post.likes + (liked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <button
            onClick={(e) => onDislike(post.id, e)}
            className="flex items-center gap-1 transition-colors hover:opacity-80"
          >
            <ThumbsDown className={`w-3.5 h-3.5 ${disliked ? 'text-gray-500 fill-gray-500' : 'text-gray-500'}`} />
            <span className="font-bold">{(post.dislikes + (disliked ? 1 : 0)).toLocaleString()}</span>
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{post.comments.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            <span>{post.views.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" />
            <span>{post.forks.toLocaleString()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
