import { MessageCircle, Search, UserMinus, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { UserAvatar } from '../../common/UserAvatar';
import type { SocialUser } from '../api/socialApi';

interface FriendSectionProps {
  friends: SocialUser[];
  onOpenChat: (user: SocialUser) => void;
  onNavigate: (view: string, data?: any) => void;
  onRemoveFriend: (user: SocialUser) => void;
  onFindFriends: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const FriendSection: React.FC<FriendSectionProps> = ({
  friends,
  onOpenChat,
  onNavigate,
  onRemoveFriend,
  onFindFriends,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[600px]">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-[#1344FF]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">내 친구</h3>
          <p className="text-xs text-gray-500">전체 {friends.length}명</p>
        </div>
      </div>

      <div className="relative group mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1344FF] transition-colors" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="닉네임으로 친구 찾기..."
          aria-label="친구 목록에서 찾기"
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1344FF] focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {friends.map((friend) => (
          <div
            key={friend.userId}
            onClick={() => !friend.deleted && onNavigate('mypage', { userId: friend.userId })}
            className={`flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors group ${friend.deleted ? '' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <UserAvatar
                name={friend.nickname}
                imageUrl={friend.profileImageUrl}
                avatarHash={friend.avatarHash}
                sizeClass="w-12 h-12"
                className="border border-gray-100 shadow-sm"
              />
              <h4 className={`font-bold text-sm truncate transition-colors ${friend.deleted ? 'text-gray-400 italic' : 'text-gray-900 group-hover:text-[#1344FF]'}`}>{friend.nickname}</h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFriend(friend);
                }}
                className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                title="친구 삭제"
                aria-label={`${friend.nickname}님 친구 삭제`}
              >
                <UserMinus className="w-4 h-4" />
              </button>
              {!friend.deleted && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChat(friend);
                  }}
                  className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#1344FF] hover:text-white transition-all active:scale-95"
                  title="채팅하기"
                  aria-label={`${friend.nickname}님과 채팅하기`}
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {friends.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-6">
              <UserPlus className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-900 font-black text-lg mb-2">{searchQuery ? '찾는 친구가 없어요' : '아직 친구가 없어요'}</p>
            <p className="text-gray-400 text-sm font-medium mb-8 max-w-[220px]">닉네임으로 다른 여행자를 찾아 친구 요청을 보내보세요.</p>
            <button onClick={onFindFriends} className="px-6 py-3 bg-[#1344FF] text-white rounded-2xl font-bold text-sm hover:shadow-lg hover:shadow-blue-100 transition-all active:scale-95">
              친구 찾기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
