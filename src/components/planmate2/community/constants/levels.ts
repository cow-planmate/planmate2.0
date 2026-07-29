/**
 * 커뮤니티 사용자 레벨 — 서버(UserStatsRepository.recalculateLevel)와 동일한 기준을 사용한다.
 * 활동 점수 = 게시글 수 * 3 + 댓글 수, 구간 [0, 10, 30, 70, 150) = Lv1~5
 */
export const POST_SCORE_WEIGHT = 3;
export const COMMENT_SCORE_WEIGHT = 1;

export interface LevelTier {
  level: number;
  name: string;
  /** 이 레벨에 진입하는 최소 활동 점수 */
  min: number;
}

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: '여행 입문자', min: 0 },
  { level: 2, name: '여행 애호가', min: 10 },
  { level: 3, name: '여행 전문가', min: 30 },
  { level: 4, name: '여행 마스터', min: 70 },
  { level: 5, name: '여행 레전드', min: 150 },
];

export const levelName = (level: number): string =>
  (LEVEL_TIERS.find(tier => tier.level === level) ?? LEVEL_TIERS[0]).name;

/** 레벨 구간 설명 (예: "10-29점", 최고 레벨은 "150점 이상") */
export const levelRangeLabel = (level: number): string => {
  const index = LEVEL_TIERS.findIndex(tier => tier.level === level);
  const tier = LEVEL_TIERS[index] ?? LEVEL_TIERS[0];
  const next = LEVEL_TIERS[index + 1];
  return next ? `${tier.min}-${next.min - 1}점` : `${tier.min}점 이상`;
};

export interface LevelProgress {
  score: number;
  level: number;
  name: string;
  rangeLabel: string;
  /** 다음 레벨 진입 점수 (최고 레벨이면 null) */
  nextMin: number | null;
  nextName: string | null;
  /** 다음 레벨까지 남은 점수 (최고 레벨이면 0) */
  remaining: number;
  /** 현재 구간 내 진행률 0~100 */
  percent: number;
}

/**
 * 서버 통계(게시글/댓글 수)로 레벨 진행도를 계산한다.
 * 서버가 내려준 level이 있으면 그대로 신뢰하고, 없으면 점수로 산출한다.
 */
export const calculateLevelProgress = (
  postCount: number,
  commentCount: number,
  serverLevel?: number,
): LevelProgress => {
  const score = postCount * POST_SCORE_WEIGHT + commentCount * COMMENT_SCORE_WEIGHT;

  const derived = [...LEVEL_TIERS].reverse().find(tier => score >= tier.min) ?? LEVEL_TIERS[0];
  const level = serverLevel && LEVEL_TIERS.some(t => t.level === serverLevel) ? serverLevel : derived.level;

  const index = LEVEL_TIERS.findIndex(tier => tier.level === level);
  const current = LEVEL_TIERS[index];
  const next = LEVEL_TIERS[index + 1] ?? null;

  const percent = next
    ? Math.min(100, Math.max(0, Math.round(((score - current.min) / (next.min - current.min)) * 100)))
    : 100;

  return {
    score,
    level,
    name: current.name,
    rangeLabel: levelRangeLabel(level),
    nextMin: next?.min ?? null,
    nextName: next?.name ?? null,
    remaining: next ? Math.max(0, next.min - score) : 0,
    percent,
  };
};
