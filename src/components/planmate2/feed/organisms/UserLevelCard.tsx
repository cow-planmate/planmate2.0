import { Star } from 'lucide-react';
import React, { useMemo } from 'react';
import { LEVEL_TIERS, calculateLevelProgress, levelRangeLabel } from '../../community/constants/levels';
import { useMyStats } from '../../community/hooks/queries';

interface UserLevelCardProps {
  isAuthenticated: boolean;
}

/** 피드 사이드바 사용자 레벨 — GET /api/community/me/stats 기반 */
export const UserLevelCard: React.FC<UserLevelCardProps> = ({ isAuthenticated }) => {
  const { data: stats, isLoading, isError } = useMyStats(isAuthenticated);

  const progress = useMemo(
    () => calculateLevelProgress(stats?.postCount ?? 0, stats?.commentCount ?? 0, stats?.level),
    [stats],
  );

  return (
    <div className="rounded-[18px] border border-[#d9dce2] bg-white p-6">

      {!isAuthenticated ? (
        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-[#111318]">나의 활동 레벨</h3>
          <p className="text-sm text-[#666666] mb-3">
            로그인하면 내 활동 레벨과 진행도를 확인할 수 있어요!
          </p>
          {LEVEL_TIERS.slice(0, 3).map(tier => (
            <div
              key={tier.level}
              className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#f8f9fa]"
            >
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-gray-300" />
                <p className="text-sm font-medium text-[#666666]">Lv.{tier.level} {tier.name}</p>
              </div>
              <span className="text-[11px] text-[#999999] whitespace-nowrap">{levelRangeLabel(tier.level)}</span>
            </div>
          ))}
        </div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-24 bg-gray-100 rounded-xl" />
          <div className="h-10 bg-gray-100 rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-[#666666] text-center py-4">레벨 정보를 불러오지 못했습니다.</p>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="font-extrabold text-[#111318]">Lv.{progress.level} {progress.name}</p>
              <p className="text-sm text-[#6d7280]">
                {progress.nextMin !== null ? `다음까지 ${progress.remaining}P` : `${progress.score}P`}
              </p>
            </div>
            <div>
              <div className="w-full bg-[#eef0f3] rounded-full h-2.5">
                <div
                  className="bg-[#1344FF] h-2.5 rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
            <p className="mt-4 text-sm text-[#525865]">
              여행기가 가져가질 때마다 활동 포인트가 쌓입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
