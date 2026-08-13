import { Award, Camera, Globe, Lock, MessageSquare, Settings, User, UserPlus } from 'lucide-react';
import React from 'react';
// @ts-ignore
import type { UserBadges } from '../../community/api/communityApi';

/** 달성한 뱃지의 색 — 서버는 코드만 내려주고 표현은 클라이언트가 정한다 */
const BADGE_COLORS: Record<string, string> = {
  first_step: 'bg-amber-100 text-amber-600 border-amber-200',
  plan_master: 'bg-blue-100 text-blue-600 border-blue-200',
  eager_reviewer: 'bg-pink-100 text-pink-600 border-pink-200',
  best_partner: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  nationwide: 'bg-purple-100 text-purple-600 border-purple-200',
};

/** 달성 시각 표기 — 백필된 기존 사용자는 마이그레이션 시각이라 날짜만 보여준다 */
const formatEarnedAt = (earnedAt: string | null) =>
  earnedAt ? new Date(earnedAt).toLocaleDateString('ko-KR') : '달성 완료';

interface ProfileHeaderProps {
  dummyUser: any;
  userStats: any;
  /** 활동 뱃지 (아직 로드되지 않았거나 비공개 프로필이면 undefined → 섹션 숨김) */
  badges?: UserBadges;
  onEditProfile?: () => void;
  onViewLevel: () => void;
  onAddFriend?: () => void;
  onSendMessage?: () => void;
  myPlansCount: number;
  editablePlansCount: number;
  isOtherUser?: boolean;
  /** 내 프로필 공개 여부 (본인 프로필에서만 의미 있음) */
  isProfilePublic?: boolean;
  isSavingVisibility?: boolean;
  onToggleVisibility?: (nextPublic: boolean) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  dummyUser,
  userStats,
  badges,
  onEditProfile,
  onViewLevel,
  onAddFriend,
  onSendMessage,
  myPlansCount,
  editablePlansCount,
  isOtherUser = false,
  isProfilePublic = true,
  isSavingVisibility = false,
  onToggleVisibility,
}) => {
  const age = dummyUser.birthdate
    ? Math.max(
        0,
        new Date().getFullYear() -
          new Date(dummyUser.birthdate).getFullYear() -
          (new Date() <
          new Date(
            new Date().getFullYear(),
            new Date(dummyUser.birthdate).getMonth(),
            new Date(dummyUser.birthdate).getDate(),
          )
            ? 1
            : 0),
      )
    : null;
  const genderLabel =
    dummyUser.gender === 'MALE'
      ? '남성'
      : dummyUser.gender === 'FEMALE'
        ? '여성'
        : dummyUser.gender === 'OTHER'
          ? '기타'
          : '성별미설정';

  return (
    <div className="bg-white rounded-xl shadow-md p-5 sm:p-8 mb-8">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 min-w-0">
        {/* 프로필 이미지 */}
        <div className="relative group">
          <div className="relative">
            {dummyUser.profileLogo ? (
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
            {/* 사진 변경은 프로필 수정 모달에서 한다 — 아바타 클릭도 같은 곳으로 연결 */}
            {!isOtherUser && (
              <button
                onClick={onEditProfile}
                title="프로필 사진 변경"
                className="absolute inset-0 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8 text-white drop-shadow-lg" />
              </button>
            )}
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
        <div className="flex-1 min-w-0 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4 mb-2">
            {/* 닉네임이 길면 레벨 배지를 밀어내 배지 글자가 쪼개진다 — 배지는 고정하고 닉네임만 줄바꿈한다 */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 min-w-0">
              <h1 className="min-w-0 max-w-full break-all text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">{dummyUser.nickName}</h1>
              <button
                onClick={onViewLevel}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1 bg-gradient-to-r from-[#1344FF] to-[#4B70FF] text-white rounded-full shadow-sm hover:shadow-md transition-all hover:scale-105 active:scale-95"
              >
                <Award className="w-3 h-3 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-wider">LV.{userStats.userLevel}</span>
                <span className="w-1 h-1 shrink-0 bg-white/50 rounded-full" />
                <span className="text-xs font-bold">{userStats.level}</span>
              </button>
            </div>

            {/* 프로필 공개 범위 — 본인만 변경할 수 있다 */}
            {!isOtherUser && onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(!isProfilePublic)}
                disabled={isSavingVisibility}
                title={
                  isProfilePublic
                    ? '다른 사용자가 내 프로필을 볼 수 있습니다. 클릭하면 비공개로 바뀝니다.'
                    : '다른 사용자가 내 프로필을 볼 수 없습니다. 클릭하면 공개로 바뀝니다.'
                }
                className={`flex w-fit mx-auto md:mx-0 shrink-0 items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold border transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isProfilePublic
                    ? 'bg-blue-50 text-[#1344FF] border-[#1344FF]/30 hover:bg-blue-100'
                    : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {isProfilePublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {isProfilePublic ? '공개 프로필' : '비공개 프로필'}
                <span
                  className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                    isProfilePublic ? 'bg-[#1344FF]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                      isProfilePublic ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            )}

            {isOtherUser && (
              <div className="flex items-center justify-center md:justify-start gap-2">
                <button 
                  onClick={onAddFriend}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-[#1344FF] text-white rounded-xl text-sm font-bold hover:bg-[#0d34cc] transition-all shadow-sm active:scale-95"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  친구 추가
                </button>
                <button 
                  onClick={onSendMessage}
                  className="flex items-center gap-2 whitespace-nowrap px-4 py-2 bg-white text-[#1344FF] border border-[#1344FF] rounded-xl text-sm font-bold hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  채팅하기
                </button>
              </div>
            )}
          </div>
          
          {/* 이메일·나이·성별은 본인 프로필에서만 보인다. 타인 프로필 응답에는 이 값들이 아예 없다 */}
          {!isOtherUser && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4 min-w-0">
              <p className="min-w-0 max-w-full break-all text-sm sm:text-base text-[#666666] font-medium">{dummyUser.email}</p>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <span className="shrink-0 whitespace-nowrap px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-semibold rounded border border-gray-100">
                {genderLabel} · {age === null ? '연령미설정' : `${age}세`}
              </span>
            </div>
          )}
          
          {/* 레벨 진행바 — 활동 통계는 본인만 조회할 수 있어 타인 프로필에서는 감춘다 */}
          <div className={`max-w-xs mx-auto md:mx-0 mb-6 ${isOtherUser ? 'hidden' : ''}`}>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#1344FF] font-bold text-xs uppercase tracking-tighter">현재 경험치</span>
              <span className="text-gray-400 font-medium">
                {userStats.exp} / {userStats.maxExp} 점
              </span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1344FF] to-[#4B70FF] transition-all duration-1000"
                style={{ width: `${userStats.progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-gray-400">
              여행기·게시글 {userStats.stats?.postCount ?? 0}개 · 댓글 {userStats.stats?.commentCount ?? 0}개
              {userStats.expToNext > 0 && ` · 다음 레벨까지 ${userStats.expToNext}점`}
            </p>
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
              <p className="text-2xl font-bold text-[#1344FF]">{userStats.stats?.receivedLikes ?? 0}</p>
              <p className="text-sm text-[#666666]">좋아요</p>
            </div>
          </div>

          {/* 업적(뱃지) 섹션 — GET /api/community/{me|users/{id}}/badges */}
          {badges && badges.badges.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#1344FF]" />
                  <h3 className="text-lg font-bold text-[#1a1a1a]">
                    {isOtherUser ? "업적" : "내 업적"}
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#1344FF] bg-blue-50 px-2 py-1 rounded-full">
                  {badges.unlockedCount} / {badges.totalCount} 달성
                </span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {badges.badges.map((badge) => (
                  <div
                    key={badge.code}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 cursor-default ${
                      badge.unlocked
                        ? BADGE_COLORS[badge.code] || "bg-amber-100 text-amber-600 border-amber-200"
                        : "bg-gray-100 text-gray-400 border-gray-200"
                    }`}
                    title={
                      badge.unlocked
                        ? `${badge.description} · ${formatEarnedAt(badge.earnedAt)} 달성`
                        : `${badge.description} (${badge.progress}/${badge.goal})`
                    }
                  >
                    {badge.unlocked ? "🏆 " : "🔒 "}
                    {badge.name}
                    {!badge.unlocked && (
                      <span className="ml-1 font-medium text-[10px] text-gray-400">
                        {badge.progress}/{badge.goal}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
