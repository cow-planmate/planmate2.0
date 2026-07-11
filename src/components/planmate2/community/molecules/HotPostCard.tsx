import { Eye, Star, ThumbsUp } from 'lucide-react';

interface HotPostCardProps {
  post: any;
  index: number;
  type: string;
  onClick: () => void;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostCard = ({ post, index, type, onClick, onNavigate }: HotPostCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-100 hover:-translate-y-1 overflow-hidden cursor-pointer"
    >
      <div className="absolute -right-4 -top-4 w-16 h-16 bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150 blur-2xl" />
      
      <div className="relative z-10 flex justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-black italic ${
                index === 0 ? 'text-red-500' : index === 1 ? 'text-orange-500' : 'text-amber-500'
              }`}>
                {index + 1}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="bg-red-50 text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-tighter uppercase">HOT</span>
                {type === 'qna' && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${post.isAnswered ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {post.isAnswered ? '답변완료' : '답변대기'}
                  </span>
                )}
                {type === 'mate' && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                    post.status === 'closed' ? 'bg-gray-100 text-gray-500' : 'bg-purple-50 text-purple-600'
                  }`}>
                    {post.status === 'closed' ? '모집완료' : `모집중 ${post.participants}/${post.maxParticipants}`}
                  </span>
                )}
                {type === 'recommend' && (
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-current" />
                    {post.rating}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-gray-300">
              <Eye className="w-3 h-3" />
              {post.views}
            </div>
          </div>

          <h3 className="font-bold text-[13px] text-[#1a1a1a] mb-2 line-clamp-2 leading-snug group-hover:text-red-500 transition-colors h-9">
            {post.title}
          </h3>

          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            <div 
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate('mypage', { userId: post.userId });
              }}
            >
              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                {post.author?.[0] || 'U'}
              </div>
              <span className="text-[11px] font-bold text-gray-600">{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-red-500 font-black text-[11px]">
                <ThumbsUp className="w-3 h-3 fill-current opacity-20" />
                {post.likes}
              </div>
            </div>
          </div>
        </div>
        {post.image && (
          <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 self-center">
            <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}
      </div>
    </div>
  );
};
