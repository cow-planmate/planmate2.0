import { Bell, Check, Loader2, MessageCircle, Search, UserPlus, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApiClient } from '../../../../hooks/useApiClient';
import { UserAvatar } from '../../common/UserAvatar';
import { ErrorToast, SuccessToast } from '../../../common/Toast';
import type { SocialUser } from '../api/socialApi';
import {
  useChatRooms,
  useFriendRequests,
  useFriends,
  useRemoveFriend,
  useRespondFriendRequest,
  useSendFriendRequest,
  useUserSearch,
} from '../hooks/queries';
import { ChatSection } from '../organisms/ChatSection';
import { FriendSection } from '../organisms/FriendSection';

interface SocialPageProps {
  onOpenChat: (user: SocialUser) => void;
  onNavigate: (view: string, data?: any) => void;
}

export const SocialPage: React.FC<SocialPageProps> = ({ onOpenChat, onNavigate }) => {
  const { isAuthenticated } = useApiClient();
  const loggedIn = isAuthenticated();
  const myUserId = localStorage.getItem('userId');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFinding, setIsFinding] = useState(false);
  const [findInput, setFindInput] = useState('');
  const [findQuery, setFindQuery] = useState('');

  const { data: friendsPage } = useFriends(loggedIn);
  const { data: requestsPage } = useFriendRequests(loggedIn);
  const { data: roomsPage } = useChatRooms(loggedIn);
  const { data: foundPage, isFetching: isSearching } = useUserSearch(findQuery);
  const sendRequest = useSendFriendRequest();
  const respond = useRespondFriendRequest();
  const remove = useRemoveFriend();

  // 입력을 멈추면 검색한다
  useEffect(() => {
    const timer = setTimeout(() => setFindQuery(findInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [findInput]);

  const friends = friendsPage?.items ?? [];
  const requests = requestsPage?.items ?? [];
  const rooms = roomsPage?.items ?? [];
  const friendIds = new Set(friends.map((f) => f.userId));
  const found = (foundPage?.items ?? []).filter((u) => u.userId !== myUserId);
  const filteredFriends = friends.filter((friend) =>
    friend.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendRequest = async (user: SocialUser) => {
    try {
      const result = await sendRequest.mutateAsync(user.userId);
      SuccessToast(result.status === 'ACCEPTED'
        ? `${user.nickname}님과 친구가 되었습니다.`
        : `${user.nickname}님에게 친구 요청을 보냈습니다.`);
    } catch (e) {
      ErrorToast((e as Error).message);
    }
  };

  const handleRespond = async (id: number, accept: boolean) => {
    try {
      await respond.mutateAsync({ id, accept });
      SuccessToast(accept ? '친구 요청을 수락했습니다.' : '친구 요청을 거절했습니다.');
    } catch (e) {
      ErrorToast((e as Error).message);
    }
  };

  const handleRemoveFriend = async (user: SocialUser) => {
    if (!confirm(`${user.nickname}님을 친구에서 삭제할까요?`)) return;
    try {
      await remove.mutateAsync(user.userId);
    } catch (e) {
      ErrorToast((e as Error).message);
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-10 max-w-md w-full text-center">
          <Users className="w-10 h-10 text-[#1344FF] mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-900 mb-2">로그인이 필요해요</h2>
          <p className="text-sm text-gray-500">로그인하면 친구를 추가하고 쪽지를 주고받을 수 있어요.</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: '내 친구', value: friends.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '대화방', value: rooms.length, icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: '받은 친구 요청', value: requests.length, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '안 읽은 메시지', value: rooms.reduce((sum, r) => sum + r.unreadCount, 0), icon: MessageCircle, color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1344FF] rounded-full text-xs font-bold mb-3">
              <Users className="w-3 h-3" />
              SOCIAL CENTER
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">소셜 대시보드</h1>
            <p className="text-gray-500 font-medium">친구들과 쪽지를 주고받고 새로운 여행 메이트를 찾아보세요.</p>
          </div>

          <button
            onClick={() => setIsFinding((open) => !open)}
            aria-expanded={isFinding}
            className="flex items-center gap-2 self-start md:self-auto px-6 py-3.5 bg-[#1344FF] text-white rounded-2xl font-bold hover:bg-[#0d34cc] transition-all shadow-lg hover:shadow-blue-200 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>친구 추가</span>
          </button>
        </div>

        {/* 친구 찾기 — 닉네임으로 사용자를 찾아 요청을 보낸다 */}
        {isFinding && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1344FF]" />
              <input
                autoFocus
                type="text"
                value={findInput}
                onChange={(e) => setFindInput(e.target.value)}
                placeholder="닉네임으로 사용자 찾기"
                aria-label="닉네임으로 사용자 찾기"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#1344FF] focus:border-transparent outline-none"
              />
              {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
            </div>
            {findQuery && !isSearching && found.length === 0 && (
              <p className="mt-4 text-center text-sm text-gray-400">일치하는 사용자가 없어요.</p>
            )}
            {found.length > 0 && (
              <ul className="mt-4 divide-y divide-gray-50">
                {found.map((user) => (
                  <li key={user.userId} className="flex items-center justify-between gap-3 py-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('mypage', { userId: user.userId })}
                      className="flex min-w-0 items-center gap-3 text-left hover:text-[#1344FF]"
                    >
                      <UserAvatar name={user.nickname} imageUrl={user.profileImageUrl} avatarHash={user.avatarHash} sizeClass="w-10 h-10" />
                      <span className="truncate text-sm font-bold">{user.nickname}</span>
                    </button>
                    {friendIds.has(user.userId) ? (
                      <span className="shrink-0 text-xs font-bold text-gray-400">친구</span>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user)}
                        disabled={sendRequest.isPending}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-[#1344FF] text-xs font-bold hover:bg-blue-100 disabled:opacity-50"
                      >
                        <UserPlus className="w-3.5 h-3.5" />친구 요청
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 받은 친구 요청 */}
        {requests.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">받은 친구 요청 {requests.length}</h3>
            <ul className="divide-y divide-gray-50">
              {requests.map((request) => (
                <li key={request.id} className="flex items-center justify-between gap-3 py-3">
                  <button
                    type="button"
                    onClick={() => onNavigate('mypage', { userId: request.requester.userId })}
                    className="flex min-w-0 items-center gap-3 text-left hover:text-[#1344FF]"
                  >
                    <UserAvatar name={request.requester.nickname} imageUrl={request.requester.profileImageUrl} avatarHash={request.requester.avatarHash} sizeClass="w-10 h-10" />
                    <span className="truncate text-sm font-bold">{request.requester.nickname}</span>
                  </button>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => handleRespond(request.id, true)}
                      disabled={respond.isPending}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#1344FF] text-white text-xs font-bold hover:bg-[#0d34cc] disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />수락
                    </button>
                    <button
                      onClick={() => handleRespond(request.id, false)}
                      disabled={respond.isPending}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />거절
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FriendSection
            friends={filteredFriends}
            onOpenChat={onOpenChat}
            onNavigate={onNavigate}
            onRemoveFriend={handleRemoveFriend}
            onFindFriends={() => setIsFinding(true)}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ChatSection chatRooms={rooms} onOpenChat={onOpenChat} />
        </div>

        {/* 메이트 찾기 게시판으로 */}
        <div className="bg-gradient-to-br from-[#1344FF] to-[#4B70FF] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black mb-2">함께 떠날 메이트 찾기</h2>
              <p className="text-white/80 font-medium">메이트 찾기 게시판에서 같은 여행지로 떠나는 동행을 모아보세요.</p>
            </div>
            <button
              onClick={() => onNavigate('board-list', { boardType: 'mate' })}
              className="px-8 py-4 bg-white text-[#1344FF] rounded-2xl font-black hover:bg-opacity-90 transition-all shadow-xl active:scale-95"
            >
              메이트 찾기 게시판
            </button>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};
