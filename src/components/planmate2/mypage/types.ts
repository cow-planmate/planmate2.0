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
  isSocialLogin: boolean;
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

export interface UserStats {
  forks: number;
  feedPosts: number;
  community: number;
  comments: number;
  attendance: number;
}

export interface LevelConfig {
  lv: number;
  name: string;
  range: string;
  min: number;
  max: number;
}
