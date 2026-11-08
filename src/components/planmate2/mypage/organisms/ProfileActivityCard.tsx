import { Award } from "lucide-react";
import React from "react";
import type { UserBadges } from "../../community/api/communityApi";

/** 달성한 뱃지의 색 — 서버는 코드만 내려주고 표현은 클라이언트가 정한다 */
const BADGE_COLORS: Record<string, string> = {
  first_step: "bg-amber-100 text-amber-600 border-amber-200",
  plan_master: "bg-blue-100 text-blue-600 border-blue-200",
  eager_reviewer: "bg-pink-100 text-pink-600 border-pink-200",
  best_partner: "bg-emerald-100 text-emerald-600 border-emerald-200",
  nationwide: "bg-purple-100 text-purple-600 border-purple-200",
};

/** 달성 시각 표기 — 백필된 기존 사용자는 마이그레이션 시각이라 날짜만 보여준다 */
const formatEarnedAt = (earnedAt: string | null) =>
  earnedAt ? new Date(earnedAt).toLocaleDateString("ko-KR") : "달성 완료";

interface ProfileActivityCardProps {
  /** my-page의 userStats (useUserStats 결과 + 게시글/댓글 수) */
  userStats: any;
  /** 아직 로드되지 않았거나 비공개 프로필이면 undefined → 업적 영역 숨김 */
  badges?: UserBadges;
  isOtherUser: boolean;
  onViewLevel: () => void;
}

/** 활동 레벨·경험치·업적(뱃지) — GET /api/community/{me|users/{id}}/{stats,badges} */
export const ProfileActivityCard: React.FC<ProfileActivityCardProps> = ({ userStats, badges, isOtherUser, onViewLevel }) => (
  <section className="rounded-[26px] border border-slate-200/80 bg-white p-6 sm:p-7" aria-label="활동 레벨과 업적">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-black tracking-[0.12em] text-[#1344FF]"><Award className="h-4 w-4" />ACTIVITY</p>
        <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-950">활동 레벨</h3>
      </div>
      <button
        type="button"
        onClick={onViewLevel}
        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#1344FF] to-[#4B70FF] px-3 py-1.5 text-white shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95"
      >
        <Award className="h-3 w-3 shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-wider">LV.{userStats.userLevel}</span>
        <span className="h-1 w-1 shrink-0 rounded-full bg-white/50" />
        <span className="text-xs font-bold">{userStats.level}</span>
      </button>
    </div>

    <div className="mt-5 max-w-md">
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-bold uppercase tracking-tighter text-[#1344FF]">현재 경험치</span>
        <span className="font-medium text-gray-400">{userStats.exp} / {userStats.maxExp} 점</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
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

    {badges && badges.badges.length > 0 && (
      <div className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-slate-800">{isOtherUser ? "업적" : "내 업적"}</h4>
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-[#1344FF]">
            {badges.unlockedCount} / {badges.totalCount} 달성
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {badges.badges.map((badge) => (
            <div
              key={badge.code}
              className={`cursor-default rounded-xl border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105 ${
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
                <span className="ml-1 text-[10px] font-medium text-gray-400">{badge.progress}/{badge.goal}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);
