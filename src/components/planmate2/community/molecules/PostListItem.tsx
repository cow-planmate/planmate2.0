import { Eye, MapPin, MessageCircle, Star, ThumbsUp, Users } from 'lucide-react';
import { LevelBadge } from '../atoms/LevelBadge';

interface PostListItemProps {
  post: any;
  type: string;
  onClick: () => void;
  onNavigate: (view: any, data?: any) => void;
}

export const PostListItem = ({ post, type, onClick, onNavigate }: PostListItemProps) => {
  return (
    <div 
      className="p-4 hover:bg-[#f8f9fa] transition-colors cursor-pointer flex justify-between gap-4 group"
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {type === 'qna' && post.isAnswered && (
                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] rounded font-medium">답변완료</span>
              )}
              {type === 'qna' && !post.isAnswered && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded font-medium">답변대기</span>
              )}
              {type === 'mate' && (
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  post.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-[#1344FF]'
                }`}>
                  <Users className="w-2.5 h-2.5" />
                  {post.status === 'closed' ? '모집완료' : `${post.participants}/${post.maxParticipants}`}
                </span>
              )}
              {type === 'recommend' && (
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded font-medium flex items-center gap-0.5">
                    <MapPin className="w-2.5 h-2.5" />
                    {post.location}
                  </span>
                  <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] rounded font-medium flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {post.rating}
                  </span>
                </div>
              )}
              <h3 className="text-[15px] font-bold text-[#1a1a1a] hover:text-[#1344FF] transition-colors line-clamp-1">
                {post.title}
              </h3>
            </div>
            <p className="text-[#666666] text-xs line-clamp-1 mb-2">
              {post.content}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-[#666666]">
          <div className="flex items-center gap-2">
            <button 
              className="font-medium text-[#1a1a1a] hover:text-[#1344FF] hover:underline transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('mypage', { userId: post.userId });
              }}
            >
              {post.author}
            </button>
            <LevelBadge level={post.level} />
            <span className="text-gray-200">|</span>
            <span>{post.createdAt}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-[#1344FF]" />{post.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-[#666666]" />{post.comments}</span>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-[#666666]" />{post.views}</span>
          </div>
        </div>
      </div>
      {post.image && (
        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 self-center">
          <img src={post.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
