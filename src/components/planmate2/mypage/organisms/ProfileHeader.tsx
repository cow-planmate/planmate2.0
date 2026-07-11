import { Award, Camera, MessageSquare, Settings, User, UserPlus } from 'lucide-react';
import React from 'react';
// @ts-ignore

interface ProfileHeaderProps {
  dummyUser: any;
  userStats: any;
  onEditProfile?: () => void;
  onViewLevel: () => void;
  onAddFriend?: () => void;
  onSendMessage?: () => void;
  myPlansCount: number;
  editablePlansCount: number;
  isOtherUser?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  dummyUser,
  userStats,
  onEditProfile,
  onViewLevel,
  onAddFriend,
  onSendMessage,
  myPlansCount,
  editablePlansCount,
  isOtherUser = false,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* 프로필 이미지 */}
        <div className="relative group">
          <div className="relative">
            {dummyUser ? (
              <img
                src={dummyUser.profileLogo}
                alt="프로필"
                className="w-32 h-32 rounded-full border-4 border-[#1344FF] object-cover transition-all group-hover:brightness-90"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center transition-all group-hover:brightness-90">
                <User className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <Camera className="w-8 h-8 text-white drop-shadow-lg" />
            </div>
          </div>
          {!isOtherUser && (
            <button 
              onClick={onEditProfile}
              className="absolute bottom-0 right-0 bg-[#1344FF] text-white p-2.5 rounded-full hover:bg-[#0d34cc] transition-all shadow-lg hover:scale-110"
              title="프로필 수정"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 프로필 정보 */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4 mb-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight">{dummyUser.nickName}</h1>
              <button 
                onClick={onViewLevel}
                className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#1344FF] to-[#4B70FF] text-white rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-wider">LV.{userStats.userLevel}</span>
                <span className="w-1 h-1 bg-white/50 rounded-full" />
                <span className="text-xs font-bold">{userStats.level}</span>
              </button>
            </div>

            {isOtherUser && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <button 
                  onClick={onAddFriend}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1344FF] text-white rounded-xl text-sm font-bold hover:bg-[#0d34cc] transition-all shadow-sm active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  친구 추가
                </button>
                <button 
                  onClick={onSendMessage}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#1344FF] border border-[#1344FF] rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-4 h-4" />
                  채팅하기
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <p className="text-[#666666] font-medium">{dummyUser.email}</p>
            <span className="text-gray-300">|</span>
            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-semibold rounded border border-gray-100">
              {dummyUser.gender === 0 ? '남성' : dummyUser.gender === 1 ? '여성' : '성별미설정'} · {dummyUser.age || '연령미설정'}세
            </span>
          </div>
          
          {/* 레벨 진행바 */}
          <div className="max-w-xs mx-auto md:mx-0 mb-6">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#1344FF] font-bold text-xs uppercase tracking-tighter">현재 경험치</span>
              <span className="text-gray-400 font-medium">{userStats.exp} / {userStats.maxExp} EXP</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#1344FF] to-[#4B70FF] transition-all duration-1000"
                style={{ width: `${userStats.progress}%` }}
              />
            </div>
          </div>

          {/* 취향 태그 */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {(typeof dummyUser.preferredThemes === 'string' 
              ? dummyUser.preferredThemes.split(',') 
              : Array.isArray(dummyUser.preferredThemes)
                ? dummyUser.preferredThemes
                : ['선호 테마가 없습니다']
            ).map((tag: any, idx: number) => {
              const tagLabel = tag?.preferredThemeName || (typeof tag === 'string' ? tag.trim() : '');
              if (!tagLabel || tagLabel === '선호 테마가 없습니다') return null;
              return (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                  #{tagLabel}
                </span>
              );
            })}
          </div>
          
          {/* 통계 */}
          <div className="flex flex-wrap gap-6 justify-center md:justify-start mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1344FF]">{myPlansCount}</p>
              <p className="text-sm text-[#666666]">나의 일정</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1344FF]">{editablePlansCount}</p>
              <p className="text-sm text-[#666666]">초대된 일정</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1344FF]">0</p>
              <p className="text-sm text-[#666666]">좋아요</p>
            </div>
          </div>

          {/* 내 업적 섹션 */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1344FF]" />
                <h3 className="text-lg font-bold text-[#1a1a1a]">내 업적</h3>
              </div>
              <span className="text-xs font-bold text-[#1344FF] bg-blue-50 px-2 py-1 rounded-full">3 / 5 달성</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {[
                { title: "첫 걸음", unlocked: true, color: "bg-amber-100 text-amber-600 border-amber-200" },
                { title: "계획의 달인", unlocked: true, color: "bg-blue-100 text-blue-600 border-blue-200" },
                { title: "열혈 리뷰어", unlocked: true, color: "bg-pink-100 text-pink-600 border-pink-200" },
                { title: "베스트 파트너", unlocked: false, color: "bg-gray-100 text-gray-400 border-gray-200" },
                { title: "전국 제패", unlocked: false, color: "bg-gray-100 text-gray-400 border-gray-200" },
              ].map((achievement, idx) => (
                <div 
                  key={idx} 
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-default ${achievement.color}`}
                  title={achievement.unlocked ? "달성 완료" : "미달성"}
                >
                  {achievement.unlocked ? "🏆 " : "🔒 "}
                  {achievement.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
