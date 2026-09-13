import { Flame, MessageCircle, Star, ThumbsUp } from 'lucide-react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { UserAvatar } from '../../common/UserAvatar';

interface HotPostCardProps {
  post: any;
  index: number;
  type: string;
  onClick: () => void;
  onNavigate: (view: any, data?: any) => void;
}

const getCategoryBadge = (type: string, isAnswered?: boolean) => {
  if (type === 'qna') {
    return {
      label: isAnswered ? '답변 완료' : '답변 대기',
      className: isAnswered
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/15'
        : 'bg-amber-50 text-amber-700 ring-amber-600/15',
    };
  }

  if (type === 'recommend') {
    return {
      label: '장소 추천',
      className: 'bg-teal-50 text-teal-700 ring-teal-600/15',
    };
  }

  return {
    label: '자유',
    className: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  };
};

export const HotPostCard = ({ post, index, type, onClick, onNavigate }: HotPostCardProps) => {
  const authorNav = authorNavProps(post, onNavigate);
  const categoryBadge = getCategoryBadge(type, post.isAnswered);

  return (
    <article
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`${index + 1}위 ${post.title}`}
      className="group relative min-w-0 cursor-pointer overflow-hidden rounded-[16px] border border-[#e1e3e8] bg-white p-4 shadow-[0_2px_10px_rgba(17,24,39,0.035)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#f3c9b9] hover:shadow-[0_8px_20px_rgba(17,24,39,0.075)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05a28] focus-visible:ring-offset-2"
    >
      {index === 0 ? <div className="absolute inset-x-0 top-0 h-0.5 bg-[#f05a28]" /> : null}

      <div className="flex min-w-0 flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-extrabold text-[#e24d1d]">
            <Flame className="h-3.5 w-3.5 shrink-0 fill-current" aria-hidden="true" />
            지금 뜨는 글
          </span>
          <span className={`text-[19px] font-black leading-none tracking-[-0.05em] tabular-nums ${index === 0 ? 'text-[#f05a28]' : 'text-[#a4a9b2]'}`}>
            {index + 1}
            <span className="ml-0.5 text-[10px] font-bold tracking-normal">위</span>
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${categoryBadge.className}`}>
              {type === 'recommend' ? <Star className="h-2.5 w-2.5 fill-current" aria-hidden="true" /> : null}
              {categoryBadge.label}
              {type === 'recommend' && post.rating ? ` ${post.rating}` : null}
            </span>
          </div>
          {index === 0 ? <span className="rounded-full bg-[#fff0e9] px-2.5 py-1 text-[10px] font-extrabold text-[#e24d1d]">인기 급상승</span> : null}
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-[15px] font-extrabold leading-[1.45] tracking-[-0.015em] text-[#17191f] transition-colors group-hover:text-[#d94718]">
          {post.title}
        </h3>

        <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 border-t border-[#eef0f3] pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <UserAvatar
              name={post.author}
              imageUrl={post.authorImage}
              avatarHash={post.authorAvatarHash}
              sizeClass="h-6 w-6"
              onClick={(event) => { event.stopPropagation(); authorNav.onClick?.(event); }}
            />
            <button
              type="button"
              onClick={authorNav.onClick}
              className={`${authorNameClass(post, 'hover:text-[#d94718]')} ${authorNav.className} max-w-[110px] truncate text-[12px] font-medium text-[#686e79]`}
            >
              {post.author}
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-3 text-[11px] font-semibold tabular-nums text-[#7b818d]" aria-label={`추천 ${post.likes}, 댓글 ${post.comments}`}>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
              {post.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              {post.comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
