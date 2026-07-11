import { ChevronRight, MessageSquare, Users2 } from 'lucide-react';
import React from 'react';

interface CommunityActivitySectionProps {
  communityTab: 'written' | 'liked' | 'comments';
  setCommunityTab: (tab: 'written' | 'liked' | 'comments') => void;
  myCommunityPosts: any[];
  likedCommunityPosts: any[];
  myComments: any[];
}

export const CommunityActivitySection: React.FC<CommunityActivitySectionProps> = ({
  communityTab,
  setCommunityTab,
  myCommunityPosts,
  likedCommunityPosts,
  myComments,
}) => {
  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Users2 className="w-6 h-6 text-[#1344FF]" />
        <h3 className="text-xl font-bold text-[#1a1a1a]">커뮤니티 활동</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{myCommunityPosts.length}</span>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-12">
        <div className="flex gap-4 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setCommunityTab('written')}
            className={`px-6 py-2 rounded-md transition-all font-medium text-sm ${
              communityTab === 'written'
                ? 'bg-white text-[#1344FF] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            작성글
          </button>
          <button
            onClick={() => setCommunityTab('liked')}
            className={`px-6 py-2 rounded-md transition-all font-medium text-sm ${
              communityTab === 'liked'
                ? 'bg-white text-[#1344FF] shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            좋아요한 글
          </button>
          <button
            onClick={() => setCommunityTab('comments')}
            className={`px-6 py-2 rounded-md transition-all font-medium text-sm ${
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
            <div key={post.id} className="group p-4 rounded-xl border border-[#e5e7eb] hover:border-[#1344FF] hover:bg-blue-50/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-[#1344FF] uppercase tracking-wider">{post.category}</span>
                <span className="text-xs text-gray-400 font-medium">{post.createdAt}</span>
              </div>
              <h4 className="text-[#1a1a1a] font-bold mb-3 group-hover:text-[#1344FF] transition-colors">{post.title}</h4>
              <div className="flex items-center gap-4 text-xs text-gray-400">
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
            <div key={post.id} className="group p-4 rounded-xl border border-[#e5e7eb] hover:border-[#1344FF] hover:bg-blue-50/30 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1344FF] uppercase tracking-wider">{post.category}</span>
                  <span className="text-[10px] text-gray-400 font-medium px-1.5 py-0.5 border border-gray-200 rounded">추천함</span>
                </div>
                <span className="text-xs text-gray-400 font-medium">{post.likedAt}</span>
              </div>
              <h4 className="text-[#1a1a1a] font-bold mb-2 group-hover:text-[#1344FF] transition-colors">{post.title}</h4>
              <p className="text-xs text-gray-500 mb-3">작성자: {post.author}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400" />조회 {post.views}</span>
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400 text-red-400" />추천 {post.likes}</span>
                <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-gray-400" />댓글 {post.comments}</span>
              </div>
            </div>
          ))}

          {communityTab === 'comments' && myComments.map(comment => (
            <div key={comment.id} className="p-4 rounded-xl border border-[#e5e7eb] hover:bg-gray-50 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-[#1344FF]" />
                </div>
                <div className="flex-1">
                  <p className="text-[#1a1a1a] text-sm font-medium mb-2 leading-relaxed italic">"{comment.content}"</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 group">
                      <span className="text-[11px] text-gray-400">원문:</span>
                      <span className="text-[11px] text-gray-600 font-semibold group-hover:text-[#1344FF] truncate max-w-[200px]">{comment.postTitle}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300 group-hover:text-[#1344FF]" />
                    </div>
                    <span className="text-[11px] text-gray-400">{comment.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
