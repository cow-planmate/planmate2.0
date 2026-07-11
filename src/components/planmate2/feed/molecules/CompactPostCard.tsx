import { Clock, Eye, MessageCircle, ThumbsUp } from 'lucide-react';
import React from 'react';

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
            className="group bg-white hover:bg-gray-50 border-b border-gray-100 py-6 px-8 flex items-center justify-between transition-all cursor-pointer"
        >
            {/* 좌측 정보 영역 */}
            <div className="flex flex-col gap-2 flex-1 min-w-0 pr-8">
                <div className="flex items-center gap-3">
                    <span className="shrink-0 px-2 py-0.5 bg-blue-50 text-[#1344FF] text-[10px] font-bold rounded border border-blue-100">
                        {post.destination}
                    </span>
                    <h3 className="text-lg font-bold text-[#1a1a1a] truncate group-hover:text-[#1344FF] transition-colors">
                        {post.title}
                    </h3>
                </div>

                <p className="text-sm text-gray-500 line-clamp-1">
                    {post.description}
                </p>

                <div className="flex items-center gap-3 text-[12px] text-gray-400 mt-1">
                    <span className="font-bold text-gray-700">{post.author}</span>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">LV.2</span>
                    <span>•</span>
                    <span>{post.createdAt || '방금 전'}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.duration}
                    </div>
                </div>
            </div>

            {/* 우측 통계 및 썸네일 영역 */}
            <div className="flex items-center gap-8 shrink-0">
                <div className="flex items-center gap-5 text-[12px] text-gray-400">
                    <span className="flex items-center gap-1.5 transition-colors hover:text-[#1344FF]">
                        <ThumbsUp className={`w-4 h-4 ${liked ? 'text-[#1344FF] fill-[#1344FF]' : ''}`} />
                        <span className={liked ? 'text-[#1344FF] font-bold' : ''}>{post.likes}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        {post.views}
                    </span>
                </div>

                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 group-hover:shadow-md transition-all">
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
