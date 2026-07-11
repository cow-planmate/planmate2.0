import { Send, X } from 'lucide-react';
import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  otherUser: any;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, otherUser }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '안녕하세요! 여행 일정 보고 연락드렸어요.', sender: 'other', timestamp: '오후 2:00' },
    { id: 2, text: '네, 안녕하세요! 어떤 점이 궁금하신가요?', sender: 'me', timestamp: '오후 2:05' },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#1344FF] p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img 
              src={otherUser?.profileLogo || 'https://via.placeholder.com/40'} 
              alt={otherUser?.nickName} 
              className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
            />
            <div>
              <h3 className="font-bold">{otherUser?.nickName}님과의 채팅</h3>
              <p className="text-[10px] opacity-80">현재 유료 채팅 서비스 체험 중</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.sender === 'me' 
                  ? 'bg-[#1344FF] text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-1 ${msg.sender === 'me' ? 'text-white/70 text-right' : 'text-gray-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#1344FF] text-sm"
          />
          <button 
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-[#1344FF] text-white rounded-xl hover:bg-[#0d34cc] disabled:bg-gray-300 transition-all shadow-md active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
