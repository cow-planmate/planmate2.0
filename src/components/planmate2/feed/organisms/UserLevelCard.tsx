import { Award, Star } from 'lucide-react';
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
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-[#1344FF]" />
        <h3 className="text-lg font-bold text-[#1a1a1a]">사용자 레벨</h3>
      </div>

      {!isAuthenticated ? (
        <div className="space-y-2">
          <p className="text-sm text-[#666666] mb-3 text-center">
            로그인하면 내 활동 레벨과 진행도를 확인할 수 있어요!
          </p>
          {LEVEL_TIERS.map(tier => (
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
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#1344FF] to-[#7c3aed] rounded-full flex items-center justify-center text-white font-bold">
                Lv.{progress.level}
              </div>
              <div>
                <p className="font-bold text-[#1a1a1a]">{progress.name}</p>
                <p className="text-sm text-[#666666]">{progress.rangeLabel}</p>
              </div>
            </div>
            <p className="text-xs text-[#666666] mb-3">
              여행기·게시글 {stats?.postCount ?? 0}개 · 댓글 {stats?.commentCount ?? 0}개
            </p>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#666666]">진행도</span>
                <span className="font-medium text-[#1344FF]">
                  {progress.nextMin !== null ? `${progress.score}/${progress.nextMin}점` : `${progress.score}점`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#1344FF] to-[#7c3aed] h-2 rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {LEVEL_TIERS.map(tier => {
              const isCurrent = tier.level === progress.level;
              return (
                <div
                  key={tier.level}
                  className={`flex items-center justify-between gap-3 p-2 rounded-xl border-2 ${isCurrent
                    ? 'bg-blue-50 border-[#1344FF]'
                    : 'bg-[#f8f9fa] border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Star
                      className={`w-4 h-4 ${isCurrent ? 'text-[#1344FF] fill-current' : 'text-gray-300'}`}
                    />
                    <p className={`text-sm font-medium ${isCurrent ? 'text-[#1344FF]' : 'text-[#666666]'}`}>
                      Lv.{tier.level} {tier.name}
                    </p>
                  </div>
                  <span className="text-[11px] text-[#999999] whitespace-nowrap">{levelRangeLabel(tier.level)}</span>
                </div>
              );
            })}
            <div className="text-center">
              <p className="text-xs text-[#666666]">
                {progress.nextMin !== null
                  ? `다음 레벨까지 ${progress.remaining}점 남았어요!`
                  : '최고 레벨을 달성했어요! 🎉'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
