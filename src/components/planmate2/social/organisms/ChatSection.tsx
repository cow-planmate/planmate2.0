import { MessageCircle } from 'lucide-react';
import React from 'react';

interface ChatSectionProps {
  chatRooms: any[];
  onOpenChat: (user: any) => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({ chatRooms, onOpenChat }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">최근 채팅</h3>
            <p className="text-xs text-gray-500">대화 중인 방 {chatRooms.length}개</p>
          </div>
        </div>
        <button className="text-gray-400 text-sm font-medium hover:text-gray-600">편집</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {chatRooms.map((room) => (
          <div 
            key={room.id} 
            onClick={() => onOpenChat(room.otherUser)}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100 group"
          >
            <img 
              src={room.otherUser.profileLogo} 
              alt={room.otherUser.nickName} 
              className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-900 truncate group-hover:text-[#1344FF] transition-colors">{room.otherUser.nickName}</h4>
                <span className="text-[10px] text-gray-400 font-medium">{room.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 truncate font-medium">{room.lastMessage}</p>
                {room.unreadCount > 0 && (
                  <span className="bg-[#1344FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {chatRooms.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-purple-200" />
            </div>
            <p className="text-gray-900 font-bold text-base mb-1">최근 대화가 없어요</p>
            <p className="text-gray-400 text-xs px-10">친구들에게 먼저 인사를 건네보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};
