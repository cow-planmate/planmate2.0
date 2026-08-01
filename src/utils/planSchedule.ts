/**
 * 여행 일정의 시점 분류 — 마이페이지 "여행 상세 일정" 탭과 카드 배지가 공유한다.
 * 원래 my-page.tsx 안에 인라인으로 있던 로직을 그대로 옮긴 것이라 판정 기준은 동일하다.
 */

export type PlanStatus = 'ongoing' | 'upcoming' | 'past';

const STATUS_LABELS: Record<PlanStatus, string> = {
  ongoing: '진행 중',
  upcoming: '예정됨',
  past: '완료',
};

export const getPlanStatusLabel = (status: PlanStatus): string => STATUS_LABELS[status];

/** 타임존 영향을 받지 않도록 자정으로 맞춘 Date를 만든다 */
const atMidnight = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const today = (): Date => atMidnight(new Date())!;

/**
 * 날짜가 없는 플랜은 아직 일정을 짜는 중으로 보고 'upcoming'으로 둔다
 * (my-page의 기존 동작과 동일 — 지난 일정 탭으로 숨어버리면 안 된다).
 */
export const getPlanStatus = (
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined
): PlanStatus => {
  const start = atMidnight(startDate);
  const end = atMidnight(endDate);
  if (!start || !end) return 'upcoming';

  const now = today();
  if (end < now) return 'past';
  if (start <= now) return 'ongoing';
  return 'upcoming';
};

/** 'D-3' / 'D-Day' / 'D+2' */
export const getDDayLabel = (startDate: string | Date | null | undefined): string => {
  const start = atMidnight(startDate);
  if (!start) return 'D-Day';

  const diffDays = Math.round((start.getTime() - today().getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'D-Day';
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
};

export const groupPlansByStatus = <T extends { status: string }>(plans: T[]) => ({
  ongoing: plans.filter((p) => p.status === STATUS_LABELS.ongoing),
  upcoming: plans.filter((p) => p.status === STATUS_LABELS.upcoming),
  past: plans.filter((p) => p.status === STATUS_LABELS.past),
});
