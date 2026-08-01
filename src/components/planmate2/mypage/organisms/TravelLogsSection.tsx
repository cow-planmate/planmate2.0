import { BookOpen, Copy, Heart, MessageCircle, Pencil, PenTool, Trash2 } from 'lucide-react';
import React from 'react';
import { Pagination } from '../../community/atoms/Pagination';

interface TravelLogsSectionProps {
  travelTab: 'created' | 'forked' | 'liked';
  setTravelTab: (tab: 'created' | 'forked' | 'liked') => void;
  myTravelPosts: any[];
  myTravelPostsCount?: number;
  forkedTravelPosts: any[];
  likedTravelPosts: any[];
  /** 다른 사용자의 프로필 — 공개 목록인 작성한 여행기만 노출한다 */
  isOtherUser?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNavigateDetail: (post: any) => void;
  /** 내 프로필에서만 — 작성한 여행기 카드의 수정/삭제 */
  onEditPost?: (post: any) => void;
  onDeletePost?: (post: any) => void;
}

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full bg-white rounded-xl shadow-md py-16 text-center text-[#999999]">
    <BookOpen className="w-8 h-8 mx-auto mb-3 text-gray-300" />
    <p className="text-sm">{message}</p>
  </div>
);

export const TravelLogsSection: React.FC<TravelLogsSectionProps> = ({
  travelTab,
  setTravelTab,
  myTravelPosts,
  myTravelPostsCount,
  forkedTravelPosts,
  likedTravelPosts,
  isOtherUser = false,
  page,
  totalPages,
  onPageChange,
  onNavigateDetail,
  onEditPost,
  onDeletePost,
}) => {
  const currentTab = isOtherUser ? 'created' : travelTab;

  return (
    <>
      <div className="my-10 border-t border-gray-200"></div>

      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-[#1344FF]" />
        <h3 className="text-xl font-bold text-[#1a1a1a]">{isOtherUser ? '여행기' : '나의 여행기'}</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{myTravelPostsCount ?? myTravelPosts.length}</span>
      </div>

      <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
        <div className="flex border-b border-[#e5e7eb]">
          <button
            onClick={() => setTravelTab('created')}
            className={`flex-1 py-4 transition-all flex items-center justify-center gap-2 ${
              currentTab === 'created'
                ? 'text-[#1344FF] border-b-2 border-[#1344FF] bg-blue-50/50'
                : 'text-[#666666] hover:text-[#1344FF] hover:bg-gray-50'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span className="font-medium">작성한 여행기</span>
          </button>
          {!isOtherUser && (
            <>
              <button
                onClick={() => setTravelTab('forked')}
                className={`flex-1 py-4 transition-all flex items-center justify-center gap-2 ${
                  currentTab === 'forked'
                    ? 'text-[#1344FF] border-b-2 border-[#1344FF] bg-blue-50/50'
                    : 'text-[#666666] hover:text-[#1344FF] hover:bg-gray-50'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span className="font-medium">가져온 여행</span>
              </button>
              <button
                onClick={() => setTravelTab('liked')}
                className={`flex-1 py-4 transition-all flex items-center justify-center gap-2 ${
                  currentTab === 'liked'
                    ? 'text-[#1344FF] border-b-2 border-[#1344FF] bg-blue-50/50'
                    : 'text-[#666666] hover:text-[#1344FF] hover:bg-gray-50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span className="font-medium">좋아요한 여행</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {currentTab === 'created' && myTravelPosts.length === 0 && (
          <EmptyState message={isOtherUser ? '아직 작성한 여행기가 없습니다.' : '아직 작성한 여행기가 없습니다. 완성한 일정을 피드에 공유해 보세요!'} />
        )}
        {currentTab === 'forked' && forkedTravelPosts.length === 0 && (
          <EmptyState message="아직 가져온 여행이 없습니다. 마음에 드는 여행기의 일정을 가져와 보세요!" />
        )}
        {currentTab === 'liked' && likedTravelPosts.length === 0 && (
          <EmptyState message="아직 좋아요한 여행이 없습니다." />
        )}

        {currentTab === 'created' && myTravelPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onNavigateDetail(post)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {post.destination}
              </div>
              {/* 내 여행기에만 노출 — 카드 클릭(상세 이동)과 겹치지 않도록 전파를 막는다 */}
              {!isOtherUser && (onEditPost || onDeletePost) && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEditPost && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditPost(post); }}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white text-[#1a1a1a]"
                      aria-label="여행기 수정"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {onDeletePost && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeletePost(post); }}
                      className="bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white text-red-500"
                      aria-label="여행기 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-3 line-clamp-2 leading-tight">
                {post.title}
              </h3>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-[#666666]">
                  <span className="flex items-center gap-1" title="좋아요">
                    <Heart className="w-4 h-4 text-gray-400" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1" title="댓글">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    {post.comments}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[#1344FF] font-medium text-sm" title="가져간 횟수">
                  <Copy className="w-4 h-4" />
                  {post.forks}
                </span>
              </div>
              <p className="text-xs text-[#999999] mt-3">{post.createdAt}</p>
            </div>
          </div>
        ))}

        {currentTab === 'forked' && forkedTravelPosts.map(post => (
           <div
             key={post.id}
             onClick={() => onNavigateDetail(post)}
             className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
           >
             <div className="relative h-48 overflow-hidden">
               <img
                 src={post.image}
                 alt={post.title}
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               />
               <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                 {post.destination}
               </div>
               <div className="absolute top-3 left-3 bg-[#1344FF] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md flex items-center gap-1">
                 <Copy className="w-3 h-3" />
                 가져옴
               </div>
             </div>
             <div className="p-5">
               <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 line-clamp-2 leading-tight">
                 {post.title}
               </h3>
               <p className="text-sm text-[#666666] mb-4">
                 원작자: <span className="font-medium text-[#1a1a1a]">{post.originalAuthor}</span>
               </p>
               
               <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                 <div className="flex items-center gap-4 text-sm text-[#666666]">
                   <span className="flex items-center gap-1" title="좋아요">
                     <Heart className="w-4 h-4 text-gray-400" />
                     {post.likes}
                   </span>
                 </div>
                 <span className="text-xs text-[#999999]">{post.forkedAt}</span>
               </div>
             </div>
           </div>
        ))}

        {currentTab === 'liked' && likedTravelPosts.map(post => (
          <div
            key={post.id}
            onClick={() => onNavigateDetail(post)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                {post.destination}
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-2 line-clamp-2 leading-tight">
                {post.title}
              </h3>
              <p className="text-sm text-[#666666] mb-4">
                작성자: <span className="font-medium text-[#1a1a1a]">{post.author}</span>
              </p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-[#666666]">
                  <span className="flex items-center gap-1 text-red-500" title="좋아요">
                    <Heart className="w-4 h-4 fill-current" />
                    {post.likes}
                  </span>
                  <span className="flex items-center gap-1" title="댓글">
                    <MessageCircle className="w-4 h-4 text-gray-400" />
                    {post.comments}
                  </span>
                </div>
                <span className="text-xs text-[#999999]">{post.likedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </>
  );
};
