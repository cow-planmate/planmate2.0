import { Clock, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';

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
    return (
        <div
            onClick={() => onNavigate('detail', { post })}
            className="group bg-white hover:bg-gray-50 border-b border-gray-100 py-4 px-4 sm:py-6 sm:px-8 flex items-start sm:items-center justify-between gap-3 sm:gap-0 transition-all cursor-pointer"
        >
            {/* 좌측 정보 영역 */}
            <div className="flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0 sm:pr-8">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="shrink-0 whitespace-nowrap px-2 py-0.5 bg-blue-50 text-[#1344FF] text-[10px] font-bold rounded border border-blue-100">
                        {post.destination}
                    </span>
                    <h3 className="min-w-0 flex-1 text-base sm:text-lg font-bold text-[#1a1a1a] truncate group-hover:text-[#1344FF] transition-colors">
                        {post.title}
                    </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
                    {post.description}
                </p>

                {/* 좁은 화면에서는 한 줄에 다 못 담아 글자가 세로로 쪼개진다 — 넘치면 다음 줄로 흘린다 */}
                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[11px] sm:text-[12px] text-gray-400 mt-0.5 sm:mt-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <UserAvatar
                            name={post.author}
                            imageUrl={post.authorImage}
                            avatarHash={post.authorAvatarHash}
                            sizeClass="w-5 h-5"
                            className="text-[10px]"
                        />
                        <span className="font-bold text-gray-700 truncate">{post.author}</span>
                    </div>
                    <span className="shrink-0 whitespace-nowrap px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">LV.{post.level ?? 1}</span>
                    <span className="shrink-0">•</span>
                    <span className="shrink-0 whitespace-nowrap">{post.createdAt || '방금 전'}</span>
                    <span className="shrink-0 hidden sm:inline">•</span>
                    <div className="flex shrink-0 items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3 shrink-0" />
                        {post.duration}
                    </div>
                </div>

                {/* 통계 — 모바일에서는 우측에 넣을 자리가 없어 본문 아래로 내린다 */}
                <div className="flex sm:hidden items-center gap-4 text-[11px] text-gray-400 mt-1">
                    <span className="flex items-center gap-1 whitespace-nowrap">
                        <ThumbsUp className={`w-3.5 h-3.5 shrink-0 ${liked ? 'text-[#1344FF] fill-[#1344FF]' : ''}`} />
                        <span className={liked ? 'text-[#1344FF] font-bold' : ''}>{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                        <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                        {post.comments}
                    </span>
                    <span className="flex items-center gap-1 whitespace-nowrap">
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        {post.views}
                    </span>
                </div>
            </div>

            {/* 우측 통계 및 썸네일 영역 */}
            <div className="flex items-center gap-4 lg:gap-8 shrink-0">
                <div className="hidden sm:flex items-center gap-5 text-[12px] text-gray-400">
                    <span className="flex items-center gap-1.5 whitespace-nowrap transition-colors hover:text-[#1344FF]">
                        <ThumbsUp className={`w-4 h-4 shrink-0 ${liked ? 'text-[#1344FF] fill-[#1344FF]' : ''}`} />
                        <span className={liked ? 'text-[#1344FF] font-bold' : ''}>{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <MessageCircle className="w-4 h-4 shrink-0" />
                        {post.comments}
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                        <Eye className="w-4 h-4 shrink-0" />
                        {post.views}
                    </span>
                </div>

                <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 group-hover:shadow-md transition-all">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
            </div>
        </div>
    );
};
