import { Copy, MapPin, ThumbsUp } from 'lucide-react';
import React from 'react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { useRouteHover } from '../hooks/useRouteHover';
import { RouteHoverPopover } from './RouteHoverPopover';

interface CompactPostCardProps {
    post: any;
    onNavigate: (view: any, data?: any) => void;
    liked: boolean;
    onLike: (postId: number, e: React.MouseEvent) => void;
}

export const CompactPostCard: React.FC<CompactPostCardProps> = ({
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
            className="group relative flex gap-3 sm:gap-4 items-start bg-white hover:bg-[#f7f9ff] border-b border-[#eef0f3] last:border-b-0 p-4 sm:px-5 sm:py-4 transition-colors cursor-pointer"
        >
            {/* 썸네일은 왼쪽 고정 — 목록을 훑을 때 시선이 세로 한 줄로 떨어진다 */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[#eef0f3]">
                {post.image ? (
                    <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-[#b9bec7]" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                {/* 지역·기간을 글자로 먼저 — 배지로 감싸면 예쁘긴 해도 읽는 순서가 흐트러진다 */}
                <div className="flex items-center gap-1.5 text-[12px] font-bold mb-1">
                    <span className="text-[#1344FF]">{post.destination}</span>
                    <span className="text-[#c8ccd3]">·</span>
                    <span className="text-[#4b5563]">{post.duration}</span>
                </div>

                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#16181d] leading-snug line-clamp-2 group-hover:text-[#1344FF] transition-colors">
                    {post.title}
                </h3>

                {/* 좁은 화면에서는 작성자 줄과 지표 줄을 각자 한 줄씩 쓴다 — 한 줄에 우겨넣으면
                    줄바꿈이 제멋대로 일어나 어떤 카드는 지표가 오른쪽, 어떤 카드는 아래로 간다 */}
                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-[12px]">
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            onClick={authorNav.onClick}
                            className={`flex items-center gap-1.5 min-w-0 group/author ${authorNav.className}`}
                        >
                            <span className={`text-[14px] font-bold truncate ${authorNameClass(post, 'text-[#3a4150] group-hover/author:text-[#1344FF]')}`}>
                                {post.author}
                            </span>
                        </div>
                        <span className="text-[#6b7280] whitespace-nowrap">{post.createdAt}</span>
                    </div>

                    {/* 숫자마다 이름을 붙여 아이콘 해독 없이 바로 읽히게 한다 */}
                    <div className="flex items-center gap-2.5 sm:ml-auto whitespace-nowrap">
                        <button
                            onClick={(e) => onLike(post.id, e)}
                            aria-pressed={liked}
                            className={`flex items-center gap-1 font-bold transition-colors ${liked ? 'text-[#1344FF]' : 'text-[#5b6270] hover:text-[#1344FF]'}`}
                        >
                            <ThumbsUp className={`w-3.5 h-3.5 shrink-0 ${liked ? 'fill-[#1344FF]' : ''}`} />
                            추천 <span className="tabular-nums">{post.likes}</span>
                        </button>
                        <span className="text-[#5b6270]">
                            댓글 <span className="tabular-nums font-bold">{post.comments}</span>
                        </span>
                        <span className="text-[#5b6270]">
                            조회 <span className="tabular-nums font-bold">{post.views}</span>
                        </span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eef2ff] text-[#1344FF] font-bold">
                            <Copy className="w-3.5 h-3.5 shrink-0" />
                            가져감 <span className="tabular-nums">{post.forks ?? 0}</span>
                        </span>
                    </div>
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
