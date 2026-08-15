import { UserPlus, Users } from 'lucide-react';
import React, { useState } from 'react';
import { ChatSection } from '../organisms/ChatSection';
import { FriendSection } from '../organisms/FriendSection';
import { useChatRooms, useFriends } from '../hooks/queries';

interface SocialPageProps {
  onOpenChat: (user: any) => void;
  onNavigate: (view: string, data?: any) => void;
}

export const SocialPage: React.FC<SocialPageProps> = ({ onOpenChat, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: friends } = useFriends(searchQuery);
  const { data: rooms } = useChatRooms();
  const friendList = friends?.items ?? [];
  const roomList = rooms?.items ?? [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#1344FF] rounded-full text-xs font-bold mb-3">
              <Users className="w-3 h-3" />
              SOCIAL CENTER
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">소셜 대시보드</h1>
            <p className="text-gray-500 font-medium">친구들의 소식을 확인하고 새로운 인연을 만들어보세요.</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3.5 bg-[#1344FF] text-white rounded-2xl font-bold hover:bg-[#0d34cc] transition-all shadow-lg hover:shadow-blue-200 active:scale-95">
              <UserPlus className="w-5 h-5" />
              <span>친구 추가</span>
            </button>
          </div>
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FriendSection
            friends={friendList}
            onOpenChat={onOpenChat}
            onNavigate={onNavigate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ChatSection chatRooms={roomList} onOpenChat={onOpenChat} />
        </div>

      </div>
    </div>
  );
};
