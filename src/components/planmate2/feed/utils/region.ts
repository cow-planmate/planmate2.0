/** 행정구역 전체 이름 → 피드 필터 지역명 정규화 (서울특별시 종로구 → 서울) */
const REGION_PREFIXES: Array<[string, string]> = [
  ['서울', '서울'],
  ['부산', '부산'],
  ['제주', '제주도'],
  ['강릉', '강릉'],
  ['경주', '경주'],
  ['전주', '전주'],
  ['인천', '인천'],
  ['대구', '대구'],
  ['대전', '대전'],
  ['광주', '광주'],
  ['울산', '울산'],
  ['세종', '세종'],
];

export const normalizeRegion = (destination: string): string => {
  const trimmed = (destination || '').trim();
  if (!trimmed) return '';

  for (const [prefix, region] of REGION_PREFIXES) {
    if (trimmed.startsWith(prefix)) return region;
  }

  // 폴백: 첫 토큰에서 행정구역 접미사 제거 (경기도 → 경기, 강릉시 → 강릉)
  const firstToken = trimmed.split(/\s+/)[0];
  return firstToken.replace(/(특별자치도|특별자치시|특별시|광역시|도|시|군)$/, '') || firstToken;
};
