import { ExternalLink, MessageCircle, Search, Send, UserPlus, Users } from 'lucide-react';
import React from 'react';

interface FriendSectionProps {
  friends: any[];
  onOpenChat: (user: any) => void;
  onNavigate: (view: string, data?: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const FriendSection: React.FC<FriendSectionProps> = ({ 
  friends, 
  onOpenChat, 
  onNavigate,
  searchQuery,
  setSearchQuery 
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[#1344FF]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">내 친구</h3>
            <p className="text-xs text-gray-500">전체 {friends.length}명</p>
          </div>
        </div>
        <button className="text-[#1344FF] text-sm font-medium hover:underline flex items-center gap-1">
          전체보기 <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Search Bar moved here */}
      <div className="relative group mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1344FF] transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="닉네임으로 친구 찾기..." 
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1344FF] focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {friends.map((friend) => (
          <div 
            key={friend.id} 
            onClick={() => onNavigate('mypage', { userId: friend.id })}
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={friend.profileLogo} 
                  alt={friend.nickName} 
                  className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#1344FF] transition-colors">{friend.nickName}</h4>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // 계획 초대 로직 (추후 구현)
                  alert(`${friend.nickName}님을 계획에 초대했습니다!`);
                }}
                className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-50 hover:text-[#1344FF] transition-all active:scale-95 group/btn relative"
                title="계획 초대"
              >
                <Send className="w-4 h-4" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                  계획 초대
                </span>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenChat(friend);
                }}
                className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#1344FF] hover:text-white transition-all active:scale-95 group/btn relative"
                title="채팅하기"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                   채팅하기
                </span>
              </button>
            </div>
          </div>
        ))}

        {friends.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-black text-lg mb-2">아직 소식이 없어요</p>
            <p className="text-gray-400 text-sm font-medium mb-8 max-w-[200px]">새로운 친구를 찾아보고 함께 계획을 짜볼까요?</p>
            <button className="px-6 py-3 bg-[#1344FF] text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95">
              친구 추천 보기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
