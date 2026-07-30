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

/**
 * 지역명 → 지도 좌표. normalizeRegion이 만들어내는 이름(광역시·도 축약형, 주요 여행 도시)을 덮는다.
 * 여기에 없는 지역은 카카오 지오코딩으로 보완한다 (useRegionMarkers 참고).
 */
export const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // 특별시·광역시
  '서울': { lat: 37.5665, lng: 126.9780 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '세종': { lat: 36.4800, lng: 127.2890 },
  // 도 단위 — 축약형/정식 명칭 모두 받는다 (마이페이지 플랜의 region은 정식 명칭이 올라온다)
  '경기': { lat: 37.4138, lng: 127.5183 },
  '경기도': { lat: 37.4138, lng: 127.5183 },
  '강원': { lat: 37.8228, lng: 128.1555 },
  '강원도': { lat: 37.8228, lng: 128.1555 },
  '충북': { lat: 36.6357, lng: 127.4913 },
  '충청북도': { lat: 36.6357, lng: 127.4913 },
  '충남': { lat: 36.5184, lng: 126.8000 },
  '충청남도': { lat: 36.5184, lng: 126.8000 },
  '전북': { lat: 35.7175, lng: 127.1530 },
  '전라북도': { lat: 35.7175, lng: 127.1530 },
  '전남': { lat: 34.8679, lng: 126.9910 },
  '전라남도': { lat: 34.8679, lng: 126.9910 },
  '경북': { lat: 36.4919, lng: 128.8889 },
  '경상북도': { lat: 36.4919, lng: 128.8889 },
  '경남': { lat: 35.4606, lng: 128.2132 },
  '경상남도': { lat: 35.4606, lng: 128.2132 },
  '제주도': { lat: 33.4996, lng: 126.5312 },
  '제주': { lat: 33.4996, lng: 126.5312 },
  // 주요 여행 도시 (normalizeRegion 폴백으로 시/군 단위가 그대로 올라온다)
  '강릉': { lat: 37.7519, lng: 128.8761 },
  '속초': { lat: 38.2070, lng: 128.5918 },
  '양양': { lat: 38.0754, lng: 128.6190 },
  '춘천': { lat: 37.8813, lng: 127.7300 },
  '평창': { lat: 37.3705, lng: 128.3903 },
  '정선': { lat: 37.3805, lng: 128.6608 },
  '홍천': { lat: 37.6971, lng: 127.8888 },
  '가평': { lat: 37.8315, lng: 127.5095 },
  '양평': { lat: 37.4917, lng: 127.4874 },
  '수원': { lat: 37.2636, lng: 127.0286 },
  '파주': { lat: 37.7599, lng: 126.7800 },
  '경주': { lat: 35.8562, lng: 129.2247 },
  '포항': { lat: 36.0190, lng: 129.3435 },
  '안동': { lat: 36.5684, lng: 128.7294 },
  '통영': { lat: 34.8544, lng: 128.4331 },
  '거제': { lat: 34.8806, lng: 128.6211 },
  '남해': { lat: 34.8376, lng: 127.8925 },
  '전주': { lat: 35.8242, lng: 127.1480 },
  '군산': { lat: 35.9676, lng: 126.7370 },
  '여수': { lat: 34.7604, lng: 127.6622 },
  '순천': { lat: 34.9506, lng: 127.4875 },
  '목포': { lat: 34.8118, lng: 126.3922 },
  '담양': { lat: 35.3211, lng: 126.9881 },
  '태안': { lat: 36.7456, lng: 126.2980 },
  '부여': { lat: 36.2757, lng: 126.9098 },
  '공주': { lat: 36.4465, lng: 127.1190 },
  '단양': { lat: 36.9846, lng: 128.3655 },
  '충주': { lat: 36.9910, lng: 127.9260 },
};

export const getRegionCoords = (region: string) =>
  REGION_COORDINATES[region] ?? REGION_COORDINATES[normalizeRegion(region)];

/** 지도 마커 색상 — 지역명 해시로 고정 배정 (렌더마다 색이 바뀌지 않도록) */
const MARKER_COLORS = [
  '#1344FF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE',
  '#00C7BE', '#FF2D55', '#5856D6', '#A2845E', '#30B0C7',
];

export const regionColor = (region: string): string => {
  let hash = 0;
  for (let i = 0; i < region.length; i++) hash = (hash * 31 + region.charCodeAt(i)) >>> 0;
  return MARKER_COLORS[hash % MARKER_COLORS.length];
};

/** 지도 전체 보기 기본 중심 (남한 중앙부) */
export const DEFAULT_MAP_CENTER = { lat: 35.95, lng: 128.25 };
