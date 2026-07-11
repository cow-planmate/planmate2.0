import { Award, Footprints, Heart, Map, MessageCircle, Sparkles, UserPlus, Users, Utensils } from 'lucide-react';
import React, { useState } from 'react';
import { CHAT_ROOMS, FRIENDS_LIST } from '../../mypage/mockData';
import { ChatSection } from '../organisms/ChatSection';
import { FriendSection } from '../organisms/FriendSection';

interface SocialPageProps {
  onOpenChat: (user: any) => void;
  onNavigate: (view: string, data?: any) => void;
}

export const SocialPage: React.FC<SocialPageProps> = ({ onOpenChat, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFriends = FRIENDS_LIST.filter(friend => 
    friend.nickName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BADGES = [
    { icon: Utensils, label: '맛집 사냥꾼', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Footprints, label: '걷기 왕', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Map, label: '전국구 플래너', color: 'text-blue-500', bg: 'bg-blue-50' },
  ];

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

        {/* Status Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: '내 친구', value: FRIENDS_LIST.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: '활성 대화', value: CHAT_ROOMS.length, icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: '받은 좋아요', value: '1.2k', icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
            { 
              label: '소셜 랭킹', 
              value: 'TOP 5%', 
              icon: Award, 
              color: 'text-amber-600', 
              bg: 'bg-amber-50',
              isRanking: true 
            },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className={`bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${stat.isRanking ? 'cursor-help' : ''}`}
            >
              {stat.isRanking && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-4">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-gray-900">활동 배지</span>
                  </div>
                  <div className="flex gap-2">
                    {BADGES.map((badge, bIdx) => (
                      <div key={bIdx} className={`w-9 h-9 ${badge.bg} rounded-xl flex items-center justify-center group/badge relative`}>
                        <badge.icon className={`w-5 h-5 ${badge.color}`} />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/badge:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                          {badge.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <FriendSection 
            friends={filteredFriends} 
            onOpenChat={onOpenChat} 
            onNavigate={onNavigate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ChatSection chatRooms={CHAT_ROOMS} onOpenChat={onOpenChat} />
        </div>
        
        {/* Recommended & Trends (Footer info) */}
        <div className="bg-gradient-to-br from-[#1344FF] to-[#4B70FF] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black mb-2">프리미엄 메이트 찾기</h2>
              <p className="text-white/80 font-medium">나와 여행 성향이 딱 맞는 동행자를 인공지능이 추천해드려요.</p>
            </div>
            <button className="px-8 py-4 bg-white text-[#1344FF] rounded-2xl font-black hover:bg-opacity-90 transition-all shadow-xl active:scale-95">
              추천 서비스 시작하기
            </button>
          </div>
          {/* Abstract Decorations */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-20%] left-[-10%] w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};
