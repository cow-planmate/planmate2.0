export interface Plan {
  planId: string;
  planName: string;
  startDate?: string;
  endDate?: string;
  region?: string;
  duration?: string;
  isOwner?: boolean;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface PreferredTheme {
  preferredThemeId: number;
  preferredThemeName: string;
  category: 'ATTRACTION' | 'ACCOMMODATION' | 'RESTAURANT';
}

export interface UserProfile {
  userId: string;
  email: string;
  nickname: string;
  birthdate: string | null;
  gender: Gender | null;
  /** 프로필 이미지 공개 URL. null이면 Gravatar로 대체한다 */
  profileImageUrl: string | null;
  isSocialLogin: boolean;
  /** 프로필 공개 여부 — 비공개면 타인이 마이페이지를 열 수 없다 */
  profilePublic?: boolean;
  myPlans: Plan[];
  editablePlans: Plan[];
  preferredThemes: PreferredTheme[];
}

export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

export interface Trip extends Plan {
  id: string;
  title: string;
  dateStr: string;
  dDay: string;
  status: string;
  hasDates: boolean;
  theme: 'blue' | 'orange';
  progress: number;
  checklist: ChecklistItem[];
  startDateObj: Date;
  endDateObj: Date;
  lane?: number;
}

/** 커뮤니티 활동 통계 (GET /api/community/me/stats) — 레벨 산정 기준 */
export interface UserStats {
  postCount: number;
  commentCount: number;
  /** 서버가 산정한 레벨 (없으면 점수로 계산) */
  level?: number;
}

export interface LevelConfig {
  lv: number;
  name: string;
  range: string;
  min: number;
  max: number;
}
