import { Flame, MessageCircle, ThumbsUp } from 'lucide-react';
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
      className="group relative w-full min-w-0 shrink-0 snap-center cursor-pointer overflow-hidden rounded-xl border border-[#e1e3e8] bg-white px-3 py-2.5 transition-[transform,box-shadow,border-color,background-color] duration-200 hover:bg-[#fffaf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f05a28] focus-visible:ring-offset-2 md:w-auto md:shrink md:rounded-[16px] md:p-4 md:shadow-[0_2px_10px_rgba(17,24,39,0.035)] md:hover:-translate-y-0.5 md:hover:border-[#f3c9b9] md:hover:bg-white md:hover:shadow-[0_8px_20px_rgba(17,24,39,0.075)]"
    >
      {index === 0 ? <div className="absolute inset-x-0 top-0 hidden h-0.5 bg-[#f05a28] md:block" /> : null}

      <div className="flex min-w-0 items-center gap-2 md:hidden">
        <Flame className="h-4 w-4 shrink-0 fill-[#f05a28] text-[#f05a28]" aria-hidden="true" />
        <span className={`shrink-0 text-[11px] font-black tabular-nums ${index === 0 ? 'text-[#e24d1d]' : 'text-[#8b909a]'}`}>
          {index + 1}
        </span>
        <h3 className="min-w-0 flex-1 truncate text-[13px] font-bold tracking-[-0.01em] text-[#272a31]">
          {post.title}
        </h3>
        <span
          className="flex shrink-0 items-center gap-1 text-[11px] font-semibold tabular-nums text-[#7b818d]"
          aria-label={`추천 ${post.likes ?? 0}`}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
          {post.likes ?? 0}
        </span>
      </div>

      <div className="hidden min-w-0 flex-col md:flex">
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
              {categoryBadge.label}
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
