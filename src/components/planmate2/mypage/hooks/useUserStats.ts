import { useMemo } from 'react';
import { calculateLevelProgress } from '../../community/constants/levels';
import { UserStats } from '../types';

/**
 * 마이페이지 레벨 표시값 — 서버 통계(GET /api/community/me/stats)를 그대로 사용한다.
 * 산식은 community/constants/levels.ts(= 서버 UserStatsRepository.recalculateLevel)와 동일.
 *
 * @param stats 내 활동 통계 (아직 로드되지 않았으면 undefined)
 * @param fallbackLevel 통계를 조회할 수 없는 다른 사용자 프로필에서 쓰는 레벨(작성글의 작성자 레벨)
 */
export const useUserStats = (stats?: UserStats | null, fallbackLevel?: number) => {
  const progress = useMemo(
    () => calculateLevelProgress(
      stats?.postCount ?? 0,
      stats?.commentCount ?? 0,
      stats?.level ?? fallbackLevel,
    ),
    [stats, fallbackLevel],
  );

  return {
    /** 활동 점수 (게시글*3 + 댓글) */
    exp: progress.score,
    userLevel: progress.level,
    levelName: progress.name,
    /** 다음 레벨 진입 점수 (최고 레벨이면 현재 점수) */
    displayMax: progress.nextMin ?? progress.score,
    /** 다음 레벨까지 남은 점수 */
    remainingCount: progress.remaining,
    /** 현재 구간 진행률 0~100 */
    percent: progress.percent,
    isMaxLevel: progress.nextMin === null,
  };
};
