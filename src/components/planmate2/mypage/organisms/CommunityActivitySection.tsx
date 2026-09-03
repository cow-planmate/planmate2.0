import { ChevronRight, MessageSquare, Users2 } from 'lucide-react';
import React from 'react';
import { Pagination } from '../../community/atoms/Pagination';

interface CommunityActivitySectionProps {
  communityTab: 'written' | 'liked' | 'comments';
  setCommunityTab: (tab: 'written' | 'liked' | 'comments') => void;
  myCommunityPosts: any[];
  myCommunityPostsCount?: number;
  likedCommunityPosts: any[];
  myComments: any[];
  /** 타인 프로필이면 좋아요 탭을 감춘다 — 좋아요 이력은 본인만 본다 */
  isOtherUser?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNavigateDetail: (post: { id: number; category: string }) => void;
}

export const CommunityActivitySection: React.FC<CommunityActivitySectionProps> = ({
  communityTab,
  setCommunityTab,
  myCommunityPosts,
  myCommunityPostsCount,
  likedCommunityPosts,
  myComments,
  isOtherUser = false,
  page,
  totalPages,
  onPageChange,
  onNavigateDetail,
}) => {
  const currentList =
    communityTab === 'written' ? myCommunityPosts
    : communityTab === 'liked' ? likedCommunityPosts
    : myComments;
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Users2 className="h-5 w-5" /></span>
        <div><p className="text-[10px] font-black tracking-[0.12em] text-violet-600">COMMUNITY</p><h3 className="text-xl font-black tracking-[-0.03em] text-slate-950">커뮤니티 활동</h3></div>
        <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">{myCommunityPostsCount ?? myCommunityPosts.length}</span>
      </div>

      <div className="mb-8">
        {/* 탭 3개가 모바일 폭을 넘어서면 라벨이 두 줄로 쪼개진다 — 여백을 줄이고 넘치면 가로 스크롤 */}
        <div className="flex gap-1 sm:gap-4 mb-6 p-1 bg-gray-100 rounded-lg w-full sm:w-fit overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCommunityTab('written')}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-6 py-2 rounded-md transition-all font-medium text-sm ${
              communityTab === 'written'
                ? 'bg-white text-[#1344FF] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            작성글
          </button>
          {!isOtherUser && (
          <button
            onClick={() => setCommunityTab('liked')}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-6 py-2 rounded-md transition-all font-medium text-sm ${
              communityTab === 'liked'
                ? 'bg-white text-[#1344FF] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            좋아요한 글
          </button>
          )}
          <button
            onClick={() => setCommunityTab('comments')}
            className={`shrink-0 whitespace-nowrap px-3 sm:px-6 py-2 rounded-md transition-all font-medium text-sm ${
              communityTab === 'comments'
                ? 'bg-white text-[#1344FF] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            작성 댓글
          </button>
        </div>

        <div className="space-y-4">
          {communityTab === 'written' && myCommunityPosts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigateDetail(post)}
              className="group cursor-pointer border-b border-slate-100 px-1 py-5 transition-all hover:pl-3"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-xs font-bold text-[#1344FF] uppercase tracking-wider truncate">{post.category}</span>
                <span className="shrink-0 whitespace-nowrap text-xs text-gray-400 font-medium">{post.createdAt}</span>
              </div>
              <h4 className="text-[#1a1a1a] font-bold mb-3 break-keep group-hover:text-[#1344FF] transition-colors">{post.title}</h4>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                  조회 {post.views}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                  추천 {post.likes}
                </span>
                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                  <div className="w-1 h-1 rounded-full bg-gray-400" />
                  댓글 {post.comments}
                </span>
              </div>
            </div>
          ))}

          {communityTab === 'liked' && likedCommunityPosts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigateDetail(post)}
              className="group cursor-pointer border-b border-slate-100 px-1 py-5 transition-all hover:pl-3"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-[#1344FF] uppercase tracking-wider truncate">{post.category}</span>
                  <span className="shrink-0 whitespace-nowrap text-[10px] text-gray-400 font-medium px-1.5 py-0.5 border border-gray-200 rounded">추천함</span>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-gray-400 font-medium">{post.likedAt}</span>
              </div>
              <h4 className="text-[#1a1a1a] font-bold mb-2 break-keep group-hover:text-[#1344FF] transition-colors">{post.title}</h4>
              <p className="text-xs text-gray-500 mb-3 break-all">작성자: {post.author}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400" />조회 {post.views}</span>
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400 text-red-400" />추천 {post.likes}</span>
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400" />댓글 {post.comments}</span>
              </div>
            </div>
          ))}

          {communityTab === 'comments' && myComments.map(comment => (
            <div
              key={comment.id}
              onClick={() => onNavigateDetail({ id: comment.postId, category: comment.postCategory })}
              className="cursor-pointer border-b border-slate-100 px-1 py-5 transition-all hover:pl-3"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg shrink-0">
                  <MessageSquare className="w-4 h-4 text-[#1344FF]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1a1a1a] text-sm font-medium mb-2 leading-relaxed italic break-keep">"{comment.content}"</p>
                  {/* 원문 제목이 길면 날짜와 서로 밀어내므로, 좁은 화면에서는 아래로 흘린다 */}
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <div className="flex items-center gap-2 group min-w-0">
                      <span className="shrink-0 text-[11px] text-gray-400">원문:</span>
                      <span className="text-[11px] text-gray-600 font-semibold group-hover:text-[#1344FF] truncate min-w-0">{comment.postTitle}</span>
                      <ChevronRight className="w-3 h-3 shrink-0 text-gray-300 group-hover:text-[#1344FF]" />
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-[11px] text-gray-400">{comment.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {currentList.length === 0 && (
            <div className="py-14 text-center text-[#999999] text-sm">
              {communityTab === 'written' ? '작성한 글이 없습니다.'
                : communityTab === 'liked' ? '좋아요한 글이 없습니다.'
                : '작성한 댓글이 없습니다.'}
            </div>
          )}
        </div>

        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
};
