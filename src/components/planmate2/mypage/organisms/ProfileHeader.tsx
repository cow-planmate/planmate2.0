import { Camera, Globe, Lock, MessageSquare, Settings, User, UserPlus } from 'lucide-react';
import React from 'react';

interface ProfileHeaderProps {
  dummyUser: any;
  userStats: any;
  onEditProfile?: () => void;
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
  onEditProfile,
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
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 min-w-0">
              <h1 className="min-w-0 max-w-full break-all text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight">{dummyUser.nickName}</h1>
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
        </div>
      </div>
    </div>
  );
};
