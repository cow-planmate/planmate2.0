import { Star } from 'lucide-react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { UserAvatar } from '../../common/UserAvatar';

interface HotPostCardProps {
  post: any;
  index: number;
  type: string;
  onClick: () => void;
  onNavigate: (view: any, data?: any) => void;
}

export const HotPostCard = ({ post, index, type, onClick, onNavigate }: HotPostCardProps) => {
  const authorNav = authorNavProps(post, onNavigate);
  return (
    <div 
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="link"
      tabIndex={0}
      className="group relative min-w-0 cursor-pointer bg-white px-5 py-5 transition-colors hover:bg-[#f8faff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1344FF]"
    >
      <div className="flex min-w-0 gap-3">
        <span className={`shrink-0 text-[22px] font-extrabold ${index === 0 ? 'text-[#1344FF]' : 'text-[#7390ff]'}`}>
                {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-1.5">
                {type === 'qna' && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${post.isAnswered ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                    {post.isAnswered ? '답변완료' : '답변대기'}
                  </span>
                )}
                {type === 'recommend' && (
                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2 h-2 fill-current" />
                    {post.rating}
                  </span>
                )}
          </div>

          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-[#111318] transition-colors group-hover:text-[#1344FF]">
            {post.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-1 text-[13px] text-[#7b818d]">
            <UserAvatar
              name={post.author}
              imageUrl={post.authorImage}
              avatarHash={post.authorAvatarHash}
              sizeClass="h-5 w-5"
              className="mr-1"
              onClick={(event) => { event.stopPropagation(); authorNav.onClick?.(event); }}
            />
            <button type="button" onClick={authorNav.onClick} className={`${authorNameClass(post, 'hover:text-[#1344FF]')} ${authorNav.className}`}>
              {post.author}
            </button>
            <span>· 추천 <strong className="text-[#252830]">{post.likes}</strong></span>
            <span>· 댓글 <strong className="text-[#252830]">{post.comments}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
