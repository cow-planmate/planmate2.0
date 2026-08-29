import {
  BedDouble,
  Camera,
  Globe,
  Heart,
  Landmark,
  Lock,
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
    dummyUser.gender === "MALE"
      ? "남성"
      : dummyUser.gender === "FEMALE"
        ? "여성"
        : dummyUser.gender === "OTHER"
          ? "기타"
          : "성별 미설정";

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
    <header className="relative overflow-hidden bg-[linear-gradient(135deg,#f8faff_0%,#ffffff_52%,#f2f6ff_100%)] px-5 py-7 sm:px-9 sm:py-9 lg:px-12">
      <div className="pointer-events-none absolute -right-24 -top-36 h-80 w-80 rounded-full border-[52px] border-[#1344FF]/[0.035]" />

      <div className="relative">
        <div className="flex min-w-0 flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          <div className="group relative shrink-0">
            {dummyUser.profileLogo ? (
              <img
                src={dummyUser.profileLogo}
                alt={`${dummyUser.nickName}님의 프로필`}
                className="h-28 w-28 rounded-[32px] border-4 border-white object-cover shadow-[0_15px_35px_-18px_rgba(19,68,255,0.65)] ring-1 ring-slate-200 transition-all group-hover:brightness-90 sm:h-32 sm:w-32"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border-4 border-white bg-slate-100 shadow-lg ring-1 ring-slate-200 sm:h-32 sm:w-32">
                <User className="h-14 w-14 text-slate-400" />
              </div>
            )}
            {!isOtherUser ? (
              <>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="absolute inset-0 flex items-center justify-center rounded-[32px] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="프로필 사진 변경"
                >
                  <Camera className="h-8 w-8 text-white drop-shadow-lg" />
                </button>
                <button
                  type="button"
                  onClick={onEditProfile}
                  className="absolute -bottom-2 -right-2 rounded-2xl border-4 border-white bg-[#1344FF] p-2.5 text-white shadow-lg transition-transform hover:scale-105"
                  aria-label="프로필 수정"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-center md:text-left">
            <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
              <h1 className="max-w-full break-all text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                {dummyUser.nickName}
              </h1>

              {!isOtherUser && onToggleVisibility ? (
                <button
                  type="button"
                  onClick={() => onToggleVisibility(!isProfilePublic)}
                  disabled={isSavingVisibility}
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    isProfilePublic
                      ? "border-blue-200 bg-blue-50 text-[#1344FF]"
                      : "border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {isProfilePublic ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {isProfilePublic ? "공개 프로필" : "비공개 프로필"}
                  <span className={`relative h-4 w-7 rounded-full ${isProfilePublic ? "bg-[#1344FF]" : "bg-slate-300"}`}>
                    <span className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${isProfilePublic ? "translate-x-3.5" : "translate-x-0.5"}`} />
                  </span>
                </button>
              ) : null}

              {isOtherUser ? (
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onAddFriend} className="flex items-center gap-2 rounded-xl bg-[#1344FF] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d34cc]">
                    <UserPlus className="h-4 w-4" /> 친구 추가
                  </button>
                  <button type="button" onClick={onSendMessage} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-[#1344FF] hover:bg-blue-50">
                    <MessageSquare className="h-4 w-4" /> 메시지
                  </button>
                </div>
              ) : null}
            </div>

            {!isOtherUser ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-500 md:justify-start">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="truncate">{dummyUser.email}</span>
                </span>
                <span className="hidden h-3 w-px bg-slate-300 sm:block" />
                <span>{genderLabel} · {age === null ? "연령 미설정" : `${age}세`}</span>
              </div>
            ) : null}

            <div className="mt-7 grid max-w-xl grid-cols-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_10px_30px_-25px_rgba(15,23,42,0.5)]">
              {stats.map(({ label, value, icon: Icon }, index) => (
                <div key={label} className={`flex items-center justify-center gap-2 px-2 py-3.5 ${index > 0 ? "border-l border-slate-200" : ""}`}>
                  <Icon className={`hidden h-4 w-4 sm:block ${index === 2 ? "text-[#1344FF]" : "text-slate-400"}`} />
                  <div>
                    <p className={`text-lg font-black leading-none ${index === 2 ? "text-[#1344FF]" : "text-slate-950"}`}>{value}</p>
                    <p className="mt-1.5 whitespace-nowrap text-[11px] font-semibold text-slate-500 sm:text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="mt-7 rounded-[24px] border border-slate-200/80 bg-white/75 p-4 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)] backdrop-blur-sm sm:mt-8 sm:p-5" aria-label="여행 취향">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1344FF] text-white shadow-md shadow-blue-100">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">나의 여행 취향</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">선호 테마 {totalThemes}개</p>
              </div>
            </div>
            {!isOtherUser ? (
              <button type="button" onClick={onEditThemes} className="text-xs font-bold text-[#1344FF] hover:underline">
                취향 수정
              </button>
            ) : null}
          </div>

          <div className="grid gap-2.5 lg:grid-cols-3">
            {THEME_GROUPS.map(({ key, label, description, icon: Icon, color }) => {
              const themes = themesByCategory.get(key) ?? [];
              return (
                <div key={key} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <h3 className="shrink-0 text-xs font-extrabold text-slate-700">{label}</h3>
                      <span className="text-[10px] text-slate-400">{description}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                      {themes.length > 0 ? themes.map((theme) => (
                        <span key={`${key}-${theme}`} className="text-xs font-semibold text-slate-600">
                          {theme}
                        </span>
                      )) : (
                        <span className="text-xs text-slate-400">아직 선택한 취향이 없어요</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </header>
  );
};
