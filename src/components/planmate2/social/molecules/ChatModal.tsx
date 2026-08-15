import { Send, Trash2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createChatRoom, fetchChatMessages, type ChatMessage, type MessageDeleteScope } from '../api/socialApi';
import { useChatWebSocket, type ChatSocketEvent } from '../hooks/useChatWebSocket';

interface ChatModalProps { isOpen: boolean; onClose: () => void; otherUser: any; }

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, otherUser }) => {
  const [message, setMessage] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [selectedDelete, setSelectedDelete] = useState<ChatMessage | null>(null);
  const myId = localStorage.getItem('userId');
  const userId = otherUser?.userId;
  const queryClient = useQueryClient();

  const handleRealtimeEvent = useCallback((event: ChatSocketEvent) => {
    if (event.type === 'CHAT_MESSAGE') {
      const incoming = event.payload as ChatMessage;
      setMessages(current => {
        if (incoming.roomId !== roomId) return current;
        const withoutDuplicate = current.filter(item => item.id !== incoming.id);
        return [...withoutDuplicate, incoming].sort((left, right) => left.id - right.id);
      });
      void queryClient.invalidateQueries({ queryKey: ['social', 'rooms'] });
    }
    if (event.type === 'CHAT_MESSAGE_DELETED' || event.type === 'CHAT_MESSAGE_HIDDEN') {
      const deleted = event.payload as { roomId: number; messageId: number };
      if (deleted.roomId !== roomId) return;
      setMessages(current => event.type === 'CHAT_MESSAGE_HIDDEN'
        ? current.filter(item => item.id !== deleted.messageId)
        : current.map(item => item.id === deleted.messageId
          ? { ...item, content: null, deleted: true }
          : item));
      void queryClient.invalidateQueries({ queryKey: ['social', 'rooms'] });
    }
    if (event.type === 'ERROR') {
      const payload = event.payload as { message?: string };
      setError(payload.message || '채팅 요청을 처리하지 못했습니다.');
    }
  }, [queryClient, roomId]);

  const { connected, send } = useChatWebSocket(isOpen ? roomId : null, handleRealtimeEvent);

  useEffect(() => {
    if (!isOpen || !userId) return;
    let alive = true;
    setError(''); setMessages([]); setRoomId(null);
    createChatRoom(userId)
      .then(async room => {
        if (!alive) return;
        setRoomId(room.roomId);
        const result = await fetchChatMessages(room.roomId);
        if (!alive) return;
        const ordered = [...result.messages].reverse();
        setMessages(current => {
          const merged = new Map([...ordered, ...current].map(item => [item.id, item]));
          return [...merged.values()].sort((left, right) => left.id - right.id);
        });
      })
      .catch((e: Error) => alive && setError(e.message));
    return () => { alive = false; };
  }, [isOpen, userId]);

  useEffect(() => {
    const last = messages.at(-1);
    if (connected && roomId && last && last.senderId !== myId) {
      send({ type: 'READ_MESSAGE', roomId, messageId: last.id });
    }
  }, [connected, messages, myId, roomId, send]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = message.trim();
    if (!content || !roomId) return;
    if (!send({ type: 'SEND_MESSAGE', roomId, content })) {
      setError('채팅 서버에 연결 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setMessage('');
    setError('');
  };

  const handleDelete = (scope: MessageDeleteScope) => {
    if (!roomId || !selectedDelete) return;
    if (!send({ type: 'DELETE_MESSAGE', roomId, messageId: selectedDelete.id, scope })) {
      setError('채팅 서버에 연결 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setSelectedDelete(null);
  };

  if (!isOpen) return null;
  const nickname = otherUser?.nickname || otherUser?.nickName || '사용자';
  const image = otherUser?.profileImageUrl || otherUser?.profileLogo || 'https://via.placeholder.com/40';
  return <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div className="relative bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="bg-[#1344FF] p-4 flex items-center justify-between text-white"><div className="flex items-center gap-3"><img src={image} alt={nickname} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover" /><h3 className="font-bold">{nickname}님과의 채팅</h3></div><button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full"><X className="w-5 h-5" /></button></div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">{error && <p className="text-sm text-red-500 text-center">{error}</p>}{messages.map(msg => <div key={msg.id} className={`group flex items-center gap-1 ${msg.senderId === myId ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === myId ? 'bg-[#1344FF] text-white rounded-tr-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'} ${msg.deleted ? 'italic opacity-60' : ''}`}><p>{msg.deleted ? '삭제된 메시지입니다.' : msg.content}</p><p className="text-[9px] mt-1 opacity-70">{new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })}</p></div>{!msg.deleted && <button onClick={() => setSelectedDelete(msg)} className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500" title="메시지 삭제"><Trash2 className="w-4 h-4" /></button>}</div>)}</div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2"><input value={message} onChange={e => setMessage(e.target.value)} maxLength={2000} placeholder={connected ? '메시지를 입력하세요...' : '채팅 서버에 연결 중...'} className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#1344FF] text-sm" /><button type="submit" disabled={!message.trim() || !roomId || !connected} className="p-2 bg-[#1344FF] text-white rounded-xl disabled:bg-gray-300"><Send className="w-5 h-5" /></button></form>
      {selectedDelete && <div className="absolute inset-0 z-10 flex items-end bg-black/30 p-4" onClick={() => setSelectedDelete(null)}><div className="w-full rounded-2xl bg-white p-4 shadow-xl" onClick={e => e.stopPropagation()}><p className="mb-3 text-center text-sm font-bold text-gray-900">메시지 삭제</p>{selectedDelete.senderId === myId && <button onClick={() => handleDelete('EVERYONE')} className="w-full rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50">전체 메시지 삭제</button>}<button onClick={() => handleDelete('ME')} className="w-full rounded-xl px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">나만 삭제</button><button onClick={() => setSelectedDelete(null)} className="mt-1 w-full rounded-xl px-4 py-3 text-sm font-medium text-gray-400 hover:bg-gray-50">취소</button></div></div>}
    </div>
  </div>;
};
