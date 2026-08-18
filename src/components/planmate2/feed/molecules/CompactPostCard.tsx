import { Copy, ImageIcon, ThumbsUp } from 'lucide-react';
import React from 'react';
import { authorNameClass, authorNavProps } from '../../common/authorLink';
import { UserAvatar } from '../../common/UserAvatar';
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

    const firstDayPlaces = post.placesByDay?.[0]?.places ?? [];

    return (
        <article
            onClick={() => onNavigate('detail', { post })}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onNavigate('detail', { post });
                }
            }}
            role="link"
            tabIndex={0}
            {...cardProps}
            className="group relative grid grid-cols-1 sm:grid-cols-[250px_minmax(0,1fr)] gap-0 sm:gap-7 bg-white border-b border-[#e5e7eb] last:border-b-0 px-4 py-5 sm:px-6 sm:py-6 transition-colors hover:bg-[#fbfcff] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1344FF]"
        >
            <div className="relative w-full aspect-[4/2.4] sm:aspect-auto sm:h-[188px] shrink-0 rounded-xl overflow-hidden bg-[#f1f1f3]">
                {post.image ? (
                    <img
                        src={post.image}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#b7bbc4]">
                        <ImageIcon className="w-7 h-7" />
                        <span className="text-sm font-medium">사진</span>
                    </div>
                )}
                {(post.destination || post.duration) && (
                    <span className="absolute left-3 top-3 max-w-[calc(100%-24px)] truncate rounded-lg bg-[#37383c]/90 px-3 py-1.5 text-sm font-bold text-white">
                        {[post.destination, post.duration].filter(Boolean).join(' · ')}
                    </span>
                )}
            </div>

            <div className="flex min-w-0 flex-col pt-4 sm:pt-0">
                <h3 className="text-[20px] sm:text-[24px] font-extrabold text-[#111318] leading-tight line-clamp-2 group-hover:text-[#1344FF] transition-colors">
                    {post.title}
                </h3>

                {post.description && (
                    <p className="mt-2 text-[15px] text-[#737986] leading-snug line-clamp-2">
                        {post.description}
                    </p>
                )}

                {firstDayPlaces.length > 0 && (
                    <div className="mt-4 flex min-w-0 items-start gap-2 text-[16px] sm:text-[18px] text-[#343740]">
                        <strong className="shrink-0 text-[#111318]">DAY 1</strong>
                        <p className="line-clamp-2 min-w-0">
                            {firstDayPlaces.slice(0, 4).map((place: string, index: number) => (
                                <React.Fragment key={`${place}-${index}`}>
                                    {index > 0 && <span className="mx-2 text-[#737986]">→</span>}
                                    <span>{place}</span>
                                </React.Fragment>
                            ))}
                        </p>
                    </div>
                )}

                <div className="mt-5 flex flex-wrap items-end justify-between gap-3 sm:mt-auto text-[13px] sm:text-[14px]">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-1 text-[#a1a6b0]">
                        <UserAvatar
                            name={post.author}
                            imageUrl={post.authorImage}
                            avatarHash={post.authorAvatarHash}
                            sizeClass="h-6 w-6"
                            className="mr-1"
                            onClick={(event) => { event.stopPropagation(); authorNav.onClick?.(event); }}
                        />
                        <button
                            type="button"
                            onClick={authorNav.onClick}
                            className={`max-w-[160px] truncate transition-colors ${authorNameClass(post, 'hover:text-[#1344FF]')} ${authorNav.className}`}
                        >
                            {post.author}
                        </button>
                        <span>·</span>
                        <button
                            onClick={(e) => onLike(post.id, e)}
                            aria-pressed={liked}
                            className={`flex items-center gap-1 transition-colors ${liked ? 'font-bold text-[#1344FF]' : 'hover:text-[#1344FF]'}`}
                        >
                            <ThumbsUp className="sr-only" />추천 {post.likes}
                        </button>
                        <span>· 댓글 {post.comments}</span>
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 text-[17px] font-extrabold text-[#1344FF]">
                        <Copy className="w-4 h-4" aria-hidden="true" />
                        {post.forks ?? 0}
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
