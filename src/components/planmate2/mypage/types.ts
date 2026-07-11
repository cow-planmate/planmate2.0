export interface Plan {
  planId: number;
  planName: string;
  startDate: string;
  endDate: string;
  region: string;
  duration: string;
  isOwner: boolean;
}

export interface ChecklistItem {
  id: number;
  text: string;
  done: boolean;
}

export interface Trip extends Plan {
  id: number;
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
