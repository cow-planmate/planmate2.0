import { Copy, MapPin, ThumbsUp } from 'lucide-react';
import React from 'react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { useRouteHover } from '../hooks/useRouteHover';
import { RouteHoverPopover } from './RouteHoverPopover';

interface MainFeedPostCardProps {
  post: any;
  onNavigate: (view: any, data?: any) => void;
  liked: boolean;
  onLike: (postId: number, e: React.MouseEvent) => void;
}

export const MainFeedPostCard: React.FC<MainFeedPostCardProps> = ({
  post,
  onNavigate,
  liked,
  onLike,
}) => {
  const authorNav = authorNavProps(post, onNavigate);
  const hasRoute = post.placesByDay.length > 0;
  const { anchor, cursor, cardProps, popoverProps } = useRouteHover(hasRoute);

  return (
    <article
      onClick={() => onNavigate('detail', { post })}
      {...cardProps}
      className="group relative flex flex-col overflow-hidden bg-white rounded-xl border border-[#e0e2e7] hover:border-[#1344FF] transition-colors cursor-pointer"
    >
      <div className="relative aspect-[5/2] overflow-hidden bg-[#eef0f3]">
        {post.image ? (
          <img
            src={post.image}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="w-7 h-7 text-[#b9bec7]" />
          </div>
        )}

        {/* 지역·기간은 사진 우측 상단에 얹는다. 이 피드의 사진은 스크린샷·전단지처럼 밝기를
            예측할 수 없어서, 반투명이 아니라 불투명한 어두운 배지에 흰 글자로 둔다 —
            어떤 사진 위에서도 대비가 유지된다 */}
        {(post.destination || post.duration) && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#16181d]/85 text-white text-[14px] font-bold">
            {post.destination && <span>{post.destination}</span>}
            {post.destination && post.duration && <span className="text-white/50">·</span>}
            {post.duration && <span>{post.duration}</span>}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[19px] font-bold text-[#16181d] leading-snug line-clamp-2 group-hover:text-[#1344FF] transition-colors">
          {post.title}
        </h3>

        {/* 작성자와 지표를 한 줄에 둔다 — 줄 하나를 아끼면 카드가 그만큼 짧아지고,
            훑을 때 "누가 썼나"와 "반응이 어떤가"를 눈이 한 번에 잡는다.
            숫자에는 반드시 이름을 붙인다: 아이콘만 늘어놓으면 5가 조회수인지 댓글수인지 모른다.
            싫어요는 목록에서 빼고 상세에서만 (훑어보다 누르는 버튼이 되면 안 된다) */}
        <div className="mt-auto pt-3 border-t border-[#eef0f3] flex items-center justify-between gap-2 text-[12px]">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* 프로필 이동 영역은 아바타+닉네임 폭까지만 — 바깥 div가 클릭을 먹으면
                줄의 빈 공간을 눌러도 프로필로 새어 나간다 */}
            <div
              onClick={authorNav.onClick}
              className={`inline-flex items-center gap-1.5 min-w-0 shrink group/author ${authorNav.className}`}
            >
              <span className={`text-[14px] font-bold truncate ${authorNameClass(post, 'text-[#3a4150] group-hover/author:text-[#1344FF]')}`}>
                {post.author}
              </span>
            </div>
            <span className="text-[#9aa0ab] whitespace-nowrap">{post.createdAt}</span>
            <span className="w-px h-3 bg-[#e0e2e7] shrink-0" />
            <button
              onClick={(e) => onLike(post.id, e)}
              aria-pressed={liked}
              className={`flex items-center gap-1 font-bold whitespace-nowrap transition-colors ${liked ? 'text-[#1344FF]' : 'text-[#5b6270] hover:text-[#1344FF]'}`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-[#1344FF]' : ''}`} />
              추천 <span className="tabular-nums">{post.likes.toLocaleString()}</span>
            </button>
            <span className="text-[#5b6270] whitespace-nowrap">
              댓글 <span className="tabular-nums font-bold">{post.comments.toLocaleString()}</span>
            </span>
            <span className="text-[#5b6270] whitespace-nowrap">
              조회 <span className="tabular-nums font-bold">{post.views.toLocaleString()}</span>
            </span>
          </div>

          {/* 가져간 횟수 = 이 서비스에서 "좋은 여행기"의 핵심 지표라 가장 눈에 띄게 */}
          <span className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-md bg-[#eef2ff] text-[#1344FF] font-bold whitespace-nowrap">
            <Copy className="w-3.5 h-3.5" />
            가져감 <span className="tabular-nums">{post.forks.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {anchor && (
        <RouteHoverPopover
          anchor={anchor}
          placesByDay={post.placesByDay}
          postId={post.id}
          cursor={cursor}
          {...popoverProps}
        />
      )}
    </article>
  );
};
