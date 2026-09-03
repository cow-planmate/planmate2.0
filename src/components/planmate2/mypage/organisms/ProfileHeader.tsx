import {
  BedDouble,
  Camera,
  // Globe, // 공개/비공개 토글 복구 시 함께 되살린다
  Heart,
  Landmark,
  // Lock,
  Mail,
  MessageSquare,
  Route,
  Settings,
  Sparkles,
  User,
  UserPlus,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import React, { useMemo } from "react";

interface ProfileHeaderProps {
  dummyUser: any;
  userStats: any;
  onEditProfile?: () => void;
  onEditThemes?: () => void;
  onAddFriend?: () => void;
  onSendMessage?: () => void;
  myPlansCount: number;
  editablePlansCount: number;
  isOtherUser?: boolean;
  isProfilePublic?: boolean;
  isSavingVisibility?: boolean;
  onToggleVisibility?: (nextPublic: boolean) => void;
}

type ThemeCategory = "ATTRACTION" | "ACCOMMODATION" | "RESTAURANT";

const THEME_GROUPS: Array<{
  key: ThemeCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
}> = [
  {
    key: "ATTRACTION",
    label: "즐길 곳",
    description: "관광 · 체험",
    icon: Landmark,
    color: "bg-blue-50 text-[#1344FF]",
  },
  {
    key: "ACCOMMODATION",
    label: "머무는 방식",
    description: "숙소",
    icon: BedDouble,
    color: "bg-violet-50 text-violet-600",
  },
  {
    key: "RESTAURANT",
    label: "미식 취향",
    description: "음식점",
    icon: UtensilsCrossed,
    color: "bg-orange-50 text-orange-600",
  },
];

const normalizeThemes = (themes: any): Array<{ preferredThemeName: string; category: ThemeCategory }> => {
  if (typeof themes === "string") {
    return themes
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((preferredThemeName) => ({ preferredThemeName, category: "ATTRACTION" }));
  }
  return Array.isArray(themes) ? themes : [];
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  dummyUser,
  userStats,
  onEditProfile,
  onEditThemes,
  onAddFriend,
  onSendMessage,
  myPlansCount,
  editablePlansCount,
  isOtherUser = false,
  isProfilePublic = true,
  isSavingVisibility = false,
  onToggleVisibility,
}) => {
  const themesByCategory = useMemo(() => {
    const grouped = new Map<ThemeCategory, string[]>();
    THEME_GROUPS.forEach(({ key }) => grouped.set(key, []));
    normalizeThemes(dummyUser.preferredThemes).forEach((theme) => {
      const category = THEME_GROUPS.some(({ key }) => key === theme.category)
        ? theme.category
        : "ATTRACTION";
      const name = theme.preferredThemeName?.trim();
      if (name) grouped.get(category)?.push(name);
    });
    return grouped;
  }, [dummyUser.preferredThemes]);

  const totalThemes = Array.from(themesByCategory.values()).reduce(
    (count, themes) => count + themes.length,
    0,
  );

  const stats = [
    { label: "나의 일정", value: myPlansCount, icon: Route },
    { label: "초대된 일정", value: editablePlansCount, icon: Users },
    { label: "받은 좋아요", value: userStats.stats?.receivedLikes ?? 0, icon: Heart },
  ];

  return (
    <section className="grid gap-5 bg-transparent md:grid-cols-[minmax(280px,0.82fr)_minmax(0,1.65fr)]" aria-label="프로필 정보">
      <div className="relative overflow-hidden rounded-[28px] bg-white p-6 text-slate-950 ring-1 ring-slate-200/70 sm:p-7">
        <div className="relative flex h-full min-h-[390px] flex-col">
          <div className="group relative w-fit shrink-0">
            {dummyUser.profileLogo ? (
              <img
                src={dummyUser.profileLogo}
                alt={`${dummyUser.nickName}님의 프로필`}
                className="h-24 w-24 rounded-[26px] object-cover shadow-[0_12px_30px_-16px_rgba(19,68,255,0.45)] ring-4 ring-white transition-all group-hover:brightness-90"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-[26px] bg-[#eaf0ff] ring-4 ring-white">
                <User className="h-11 w-11 text-[#1344FF]/45" />
              </div>
            )}
            {!isOtherUser ? (
              <button type="button" onClick={onEditProfile} className="absolute inset-0 flex items-center justify-center rounded-[26px] opacity-0 transition-opacity group-hover:opacity-100" aria-label="프로필 사진 변경">
                <Camera className="h-7 w-7 text-white" />
              </button>
            ) : null}
          </div>

          <div className="mt-6">
            <p className="text-xs font-bold text-[#1344FF]">PLANMATE PROFILE</p>
            <h2 className="mt-2 break-all text-3xl font-black tracking-[-0.04em]">{dummyUser.nickName}</h2>
            {!isOtherUser && dummyUser.email ? <p className="mt-2 flex items-center gap-2 truncate text-sm text-slate-500"><Mail className="h-4 w-4" />{dummyUser.email}</p> : null}
          </div>

          <div className="mt-auto pt-8">
            {isOtherUser ? (
              <div className="flex gap-2">
                <button type="button" onClick={onAddFriend} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1344FF] px-3 py-3 text-sm font-bold text-white"><UserPlus className="h-4 w-4" />친구 추가</button>
                <button type="button" onClick={onSendMessage} className="rounded-xl bg-white p-3 text-[#1344FF] ring-1 ring-slate-200" aria-label="메시지 보내기"><MessageSquare className="h-5 w-5" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button type="button" onClick={onEditProfile} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1344FF] px-3 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-12px_rgba(19,68,255,0.7)]"><Settings className="h-4 w-4" />프로필 수정</button>
              {/* 공개/비공개 토글 — 추후 다시 넣을 예정이라 UI만 잠시 숨긴다 (상태·핸들러는 유지)
                {onToggleVisibility ? <button type="button" onClick={() => onToggleVisibility(!isProfilePublic)} disabled={isSavingVisibility} className="flex items-center gap-2 rounded-xl bg-white px-3 text-xs font-bold text-slate-600 ring-1 ring-slate-200 disabled:opacity-50">{isProfilePublic ? <Globe className="h-4 w-4 text-[#1344FF]" /> : <Lock className="h-4 w-4" />}{isProfilePublic ? "공개" : "비공개"}</button> : null}
              */}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: StatIcon }) => (
            <div key={label} className="rounded-[22px] bg-white p-4 ring-1 ring-slate-200/70 sm:p-5">
              <StatIcon className="h-4 w-4 text-slate-400" />
              <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-400 sm:text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[28px] bg-white p-5 ring-1 ring-slate-200/70 sm:p-7" aria-label="여행 취향">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 text-xs font-black text-[#1344FF]"><Sparkles className="h-4 w-4" />TRAVEL TASTE</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950">내가 좋아하는 여행</h2>
              <p className="mt-1 text-xs text-slate-400">선택한 취향 {totalThemes}개</p>
            </div>
            {!isOtherUser ? <button type="button" onClick={onEditThemes} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200">편집</button> : null}
          </div>

          <div className="mt-6 space-y-5">
            {THEME_GROUPS.map(({ key, label, description, icon: Icon, color }) => {
              const themes = themesByCategory.get(key) ?? [];
              return (
                <div key={key} className="grid grid-cols-[42px_minmax(0,1fr)] gap-3 border-t border-slate-100 pt-5 first:border-0 first:pt-0">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${color}`}><Icon className="h-[18px] w-[18px]" /></span>
                  <div>
                    <div className="flex items-baseline gap-2"><h3 className="text-sm font-extrabold text-slate-800">{label}</h3><span className="text-[10px] text-slate-400">{description}</span></div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {themes.length > 0 ? themes.map((theme) => <span key={`${key}-${theme}`} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{theme}</span>) : <span className="text-xs text-slate-400">아직 선택한 취향이 없어요</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
