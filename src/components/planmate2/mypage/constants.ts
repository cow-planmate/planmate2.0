import { LevelConfig } from './types';

export const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  '서울': { lat: 37.5665, lng: 126.9780 },
  '경기도': { lat: 37.4138, lng: 127.5183 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '강원도': { lat: 37.8228, lng: 128.1555 },
  '충청북도': { lat: 36.6357, lng: 127.4913 },
  '충청남도': { lat: 36.5184, lng: 126.8000 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '세종': { lat: 36.4800, lng: 127.2890 },
  '전북': { lat: 35.7175, lng: 127.1530 },
  '전라북도': { lat: 35.7175, lng: 127.1530 },
  '전남': { lat: 34.8679, lng: 126.9910 },
  '전라남도': { lat: 34.8679, lng: 126.9910 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '경북': { lat: 36.4919, lng: 128.8889 },
  '경상북도': { lat: 36.4919, lng: 128.8889 },
  '경남': { lat: 35.4606, lng: 128.2132 },
  '경상남도': { lat: 35.4606, lng: 128.2132 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '제주': { lat: 33.4996, lng: 126.5312 },
  '제주도': { lat: 33.4996, lng: 126.5312 },
};

export const LEVEL_CONFIG: LevelConfig[] = [
  { lv: 1, name: '여행 입문자', range: '0-49 EXP', min: 0, max: 49 },
  { lv: 2, name: '여행 애호가', range: '50-99 EXP', min: 50, max: 99 },
  { lv: 3, name: '여행 전문가', range: '100-199 EXP', min: 100, max: 199 },
  { lv: 4, name: '여행 마스터', range: '200-499 EXP', min: 200, max: 499 },
  { lv: 5, name: '여행 레전드', range: '500 EXP 이상', min: 500, max: 9999 },
];

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
