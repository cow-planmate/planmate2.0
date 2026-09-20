import {
  BedDouble,
  CalendarDays,
  Camera,
  Check,
  Loader2,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
  Utensils,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { PrivacyPolicyModal } from "../../../common/PrivacyPolicyModal";
import type { Gender } from "../types";

interface ProfileHeaderProps {
  dummyUser: any;
  onEditThemes?: () => void;
  onAddFriend?: () => void;
  onSendMessage?: () => void;
  isOtherUser?: boolean;
  newNickname?: string;
  setNewNickname?: (value: string) => void;
  nicknameValid?: boolean | null;
  nicknameMessage?: string;
  onCheckNickname?: () => void;
  isNicknameVerified?: boolean;
  newBirthdate?: string;
  setNewBirthdate?: (value: string) => void;
  newGender?: Gender | "";
  setNewGender?: (value: Gender) => void;
  onImageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSaving?: boolean;
  onSave?: () => void;
  onOpenPasswordChange?: () => void;
  onOpenDeleteAccount?: () => void;
  isSocialLogin?: boolean;
}

type ThemeCategory = "ATTRACTION" | "ACCOMMODATION" | "RESTAURANT";

const THEME_GROUPS: Array<{
  key: ThemeCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  { key: "ATTRACTION", label: "관광지", description: "즐길 곳", icon: Landmark, color: "bg-blue-50 text-[#1344FF]" },
  { key: "ACCOMMODATION", label: "숙소", description: "머무는 방식", icon: BedDouble, color: "bg-violet-50 text-violet-600" },
  { key: "RESTAURANT", label: "식당", description: "미식 취향", icon: Utensils, color: "bg-orange-50 text-orange-600" },
];

const normalizeThemes = (themes: any): Array<{ preferredThemeName: string; category: ThemeCategory }> => {
  if (typeof themes === "string") {
    return themes.split(",").map((name) => name.trim()).filter(Boolean)
      .map((preferredThemeName) => ({ preferredThemeName, category: "ATTRACTION" }));
  }
  return Array.isArray(themes) ? themes : [];
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  dummyUser,
  onEditThemes,
  onAddFriend,
  onSendMessage,
  isOtherUser = false,
  newNickname = "",
  setNewNickname,
  nicknameValid,
  nicknameMessage,
  onCheckNickname,
  isNicknameVerified = false,
  newBirthdate = "",
  setNewBirthdate,
  newGender = "",
  setNewGender,
  onImageChange,
  isSaving = false,
  onSave,
  onOpenPasswordChange,
  onOpenDeleteAccount,
  isSocialLogin = false,
}) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const themesByCategory = useMemo(() => {
    const grouped = new Map<ThemeCategory, string[]>();
    THEME_GROUPS.forEach(({ key }) => grouped.set(key, []));
    normalizeThemes(dummyUser.preferredThemes).forEach((theme) => {
      const category = THEME_GROUPS.some(({ key }) => key === theme.category) ? theme.category : "ATTRACTION";
      if (theme.preferredThemeName?.trim()) grouped.get(category)?.push(theme.preferredThemeName.trim());
    });
    return grouped;
  }, [dummyUser.preferredThemes]);

  const totalThemes = Array.from(themesByCategory.values()).reduce((count, themes) => count + themes.length, 0);
  const nicknameChanged = newNickname !== dummyUser.nickName;
  const saveDisabled = isSaving || (nicknameChanged && !isNicknameVerified);

  if (isOtherUser) {
    return (
      <section className="rounded-[28px] bg-white p-6 ring-1 ring-slate-200/70 sm:p-8" aria-label="프로필 정보">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
          {dummyUser.profileLogo ? (
            <img src={dummyUser.profileLogo} alt={`${dummyUser.nickName}님의 프로필`} className="h-28 w-28 rounded-[30px] object-cover ring-4 ring-blue-50" />
          ) : (
            <div className="flex h-28 w-28 items-center justify-center rounded-[30px] bg-blue-50"><User className="h-12 w-12 text-[#1344FF]/45" /></div>
          )}
          <div className="flex-1">
            <p className="text-xs font-black tracking-[0.14em] text-[#1344FF]">PLANMATE PROFILE</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950">{dummyUser.nickName}</h2>
          </div>
          {onAddFriend || onSendMessage ? (
            <div className="flex gap-2">
              {onAddFriend ? <button type="button" onClick={onAddFriend} className="flex items-center gap-2 rounded-xl bg-[#1344FF] px-5 py-3 text-sm font-bold text-white"><UserPlus className="h-4 w-4" />친구 추가</button> : null}
              {onSendMessage ? <button type="button" onClick={onSendMessage} className="rounded-xl bg-white p-3 text-[#1344FF] ring-1 ring-slate-200" aria-label="메시지 보내기"><MessageSquare className="h-5 w-5" /></button> : null}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <>
    <section className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]" aria-label="프로필 정보">
      <div className="flex h-full flex-col rounded-[26px] border border-slate-200/80 bg-white p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="relative shrink-0 rounded-[26px] bg-white p-1 ring-1 ring-slate-200">
                {dummyUser.profileLogo ? (
                  <img src={dummyUser.profileLogo} alt="내 프로필" className="h-[76px] w-[76px] rounded-[22px] object-cover sm:h-20 sm:w-20" />
                ) : (
                  <div className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-slate-100 sm:h-20 sm:w-20"><User className="h-9 w-9 text-slate-400" /></div>
                )}
                <label className="absolute -bottom-1.5 -right-1.5 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-[#1344FF] transition hover:bg-slate-50 active:scale-95" title="프로필 사진 변경">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/jpeg,image/png,image/gif,image/webp" onChange={onImageChange} disabled={isSaving} />
                </label>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-black tracking-[-0.035em] text-slate-950">내 정보 관리</h3>
                <p className="mt-1.5 max-w-[300px] break-keep text-xs leading-5 text-slate-500">프로필 사진과 기본 정보를 관리해요.</p>
              </div>
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-600 sm:flex"><Check className="h-3.5 w-3.5" />로그인 계정</span>
        </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-extrabold text-slate-600">닉네임</span>
              <div className="flex gap-2">
                <input value={newNickname} onChange={(e) => setNewNickname?.(e.target.value)} className={`h-11 min-w-0 flex-1 rounded-xl border bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:ring-2 focus:ring-[#1344FF]/15 ${nicknameValid === false ? "border-red-300" : nicknameValid ? "border-emerald-300" : "border-slate-200"}`} />
                <button type="button" onClick={onCheckNickname} className="h-11 shrink-0 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:border-[#1344FF]/30 hover:text-[#1344FF] active:scale-[0.97]">중복 확인</button>
              </div>
              {nicknameMessage ? <span className={`mt-1.5 block text-xs ${nicknameValid === false ? "text-red-500" : "text-emerald-600"}`}>{nicknameMessage}</span> : null}
            </label>

            <label>
              <span className="mb-2 block text-xs font-extrabold text-slate-600">생년월일</span>
              <div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={newBirthdate} onChange={(e) => setNewBirthdate?.(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1344FF]/15" /></div>
            </label>

            <div>
              <span className="mb-2 block text-xs font-extrabold text-slate-600">성별</span>
              <div className="flex h-11 rounded-xl bg-slate-100 p-1">
                {([['MALE', '남성'], ['FEMALE', '여성']] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setNewGender?.(value)} className={`flex-1 rounded-lg text-xs font-bold transition ${newGender === value ? "bg-white text-[#1344FF] shadow-sm" : "text-slate-400"}`}>{label}</button>
                ))}
              </div>
            </div>

            <label className="sm:col-span-2">
              <span className="mb-2 block text-xs font-extrabold text-slate-600">이메일</span>
              <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 text-sm font-medium text-slate-400"><Mail className="h-4 w-4 shrink-0" /><span className="min-w-0 truncate">{dummyUser.email}</span><span className="ml-auto shrink-0 text-[11px]">변경 불가</span></div>
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {!isSocialLogin ? <button type="button" onClick={onOpenPasswordChange} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#1344FF]"><ShieldCheck className="h-4 w-4" />비밀번호 변경</button> : null}
              <button type="button" onClick={() => setIsPrivacyOpen(true)} className="text-xs font-bold text-slate-500 transition-colors hover:text-[#1344FF]">개인정보 처리방침</button>
              <button type="button" onClick={onOpenDeleteAccount} className="text-xs font-bold text-red-500 transition-colors hover:text-red-600">회원 탈퇴</button>
            </div>
            <button type="button" onClick={onSave} disabled={saveDisabled} className="flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-[#1344FF] px-5 text-sm font-extrabold text-white transition-all duration-150 hover:bg-[#0d39df] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100">
              {isSaving ? <><Loader2 className="h-4 w-4 animate-spin" />저장 중...</> : "변경사항 저장"}
            </button>
          </div>
      </div>

      <div className="flex h-full flex-col rounded-[26px] border border-slate-200/80 bg-white p-6 sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-6">
          <div><p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-[#1344FF]"><Sparkles className="h-4 w-4" />TRAVEL TASTE</p><h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950">내가 좋아하는 여행</h3><p className="mt-1 text-xs text-slate-400">선택한 취향 {totalThemes}개</p></div>
          <button type="button" onClick={onEditThemes} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200">취향 편집</button>
        </div>
        <div className="flex flex-1 flex-col divide-y divide-slate-100">
          {THEME_GROUPS.map(({ key, label, description, icon: Icon, color }) => {
            const themes = themesByCategory.get(key) ?? [];
            return (
              <div key={key} className="grid min-h-[132px] flex-1 grid-cols-[46px_minmax(0,1fr)] content-center gap-4 py-5">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}><Icon className="h-[18px] w-[18px]" /></span>
                <div>
                  <div className="flex items-baseline gap-2"><h4 className="text-sm font-extrabold text-slate-800">{label}</h4><span className="text-[10px] text-slate-400">{description}</span></div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {themes.length ? themes.map((theme) => <span key={`${key}-${theme}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{theme}</span>) : <span className="text-xs text-slate-400">아직 선택한 취향이 없어요</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </>
  );
};
