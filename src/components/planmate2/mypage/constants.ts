import { LEVEL_TIERS, levelRangeLabel } from '../community/constants/levels';
import { LevelConfig } from './types';

// 지역 좌표는 feed/utils/region.ts 한 곳에서 관리한다 (조회는 getRegionCoords 사용)
export { REGION_COORDINATES, getRegionCoords } from '../feed/utils/region';

/**
 * 레벨 구간 — 서버 산식(게시글*3 + 댓글, 구간 0/10/30/70/150)을 그대로 따른다.
 * 정의는 community/constants/levels.ts 한 곳에 두고 여기서는 표시용 형태로 변환한다.
 */
export const LEVEL_CONFIG: LevelConfig[] = LEVEL_TIERS.map((tier, index) => ({
  lv: tier.level,
  name: tier.name,
  range: levelRangeLabel(tier.level),
  min: tier.min,
  max: LEVEL_TIERS[index + 1] ? LEVEL_TIERS[index + 1].min - 1 : Number.MAX_SAFE_INTEGER,
}));

// Helper to generate dates between start and end
export const getDatesInRange = (startDate: Date, endDate: Date) => {
  const date = new Date(startDate.getTime());
  const dates = [];
  while (date <= endDate) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
};
