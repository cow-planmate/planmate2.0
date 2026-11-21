import { Loader2, Send, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { UserAvatar } from '../../common/UserAvatar';
import { ErrorToast } from '../../../common/Toast';
import { markRoomRead, openChatRoom, type SocialUser } from '../api/socialApi';
import { useMessages, useSendMessage } from '../hooks/queries';
import { useQueryClient } from '@tanstack/react-query';

export type ChatPartner = Pick<SocialUser, 'userId' | 'nickname' | 'profileImageUrl' | 'avatarHash'>;

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: ChatPartner | null;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });

/** 1:1 쪽지 — 열 때 상대와의 방을 열고(없으면 생성), 보이는 마지막 메시지까지 읽음 처리한다 */
export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, otherUser }) => {
  const qc = useQueryClient();
  const [roomId, setRoomId] = useState<number>();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const myUserId = localStorage.getItem('userId');
  const { data, isLoading } = useMessages(roomId);
  const send = useSendMessage(roomId);
  // 서버는 최신순으로 주므로 화면에는 뒤집어 그린다
  const messages = [...(data?.messages ?? [])].reverse();
  const lastId = messages.length ? messages[messages.length - 1].id : undefined;

  useEffect(() => {
    if (!isOpen || !otherUser) return;
    let cancelled = false;
    setRoomId(undefined);
    openChatRoom(otherUser.userId)
      .then((room) => { if (!cancelled) setRoomId(room.roomId); })
      .catch((e) => { ErrorToast((e as Error).message); onClose(); });
    return () => { cancelled = true; };
    // onClose 는 매 렌더 새로 만들어지므로 의존성에서 뺀다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, otherUser?.userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
    if (roomId == null || lastId == null) return;
    markRoomRead(roomId, lastId)
      .then(() => qc.invalidateQueries({ queryKey: ['social', 'rooms'] }))
      .catch(() => {});
  }, [roomId, lastId, qc]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = message.trim();
    if (!content || roomId == null || send.isPending) return;
    try {
      await send.mutateAsync(content);
      setMessage('');
    } catch (err) {
      ErrorToast((err as Error).message);
    }
  };

  if (!isOpen || !otherUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-label={`${otherUser.nickname}님과의 대화`}
        className="bg-white w-full max-w-md h-[600px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1344FF] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar
              name={otherUser.nickname}
              imageUrl={otherUser.profileImageUrl}
              avatarHash={otherUser.avatarHash}
              sizeClass="w-10 h-10"
              className="border-2 border-white/20"
              fallbackClassName="bg-white/20 text-white"
            />
            <h3 className="font-bold truncate">{otherUser.nickname}님과의 대화</h3>
          </div>
          <button onClick={onClose} aria-label="닫기" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {(roomId == null || isLoading) && (
            <div className="flex h-full items-center justify-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
          )}
          {roomId != null && !isLoading && messages.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">첫 메시지를 보내보세요!</p>
          )}
          {messages.map((msg) => {
            const mine = msg.senderId === myUserId;
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  mine
                    ? 'bg-[#1344FF] text-white rounded-tr-none'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                }`}>
                  <p className={`whitespace-pre-wrap break-words ${msg.deleted ? 'italic opacity-60' : ''}`}>
                    {msg.deleted ? '삭제된 메시지입니다' : msg.content}
                  </p>
                  <p className={`text-[9px] mt-1 ${mine ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={2000}
            placeholder="메시지를 입력하세요..."
            aria-label="메시지 입력"
            className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#1344FF] text-sm"
          />
          <button
            type="submit"
            aria-label="보내기"
            disabled={!message.trim() || roomId == null || send.isPending}
            className="p-2 bg-[#1344FF] text-white rounded-xl hover:bg-[#0d34cc] disabled:bg-gray-300 transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
