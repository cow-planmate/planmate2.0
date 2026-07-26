/**
 * 선호테마 카테고리 매핑 (백엔드 단일 소스).
 *
 * Backend-v2의 PreferredThemeDto는 카테고리를 `category` 문자열(PreferredThemeCategory enum)
 * 하나로만 내려준다. 프론트는 과거 스펙의 preferredThemeCategoryId/Name을 기대하고 있었는데,
 * 그 필드는 응답에 존재하지 않아 카테고리 그룹핑이 전부 undefined 키 하나로 뭉개졌다.
 *
 * 화면은 카테고리를 0-based 인덱스(단계)로 다루므로 enum ↔ 인덱스 ↔ 표시명을 여기서 변환한다.
 */

/** 백엔드 enum 순서 = 화면 단계 순서 (관광지 → 숙소 → 식당) */
export const THEME_CATEGORIES = [
  { key: 'ATTRACTION', id: 0, name: '관광지' },
  { key: 'ACCOMMODATION', id: 1, name: '숙소' },
  { key: 'RESTAURANT', id: 2, name: '식당' },
];

const BY_KEY = Object.fromEntries(THEME_CATEGORIES.map((c) => [c.key, c]));
const BY_ID = Object.fromEntries(THEME_CATEGORIES.map((c) => [c.id, c]));

/** PreferredThemeDto.category("ATTRACTION") -> 0 */
export const categoryKeyToId = (key) => BY_KEY[key]?.id;

/** 0 -> "ATTRACTION" (PATCH /api/user/preferredThemes의 맵 키로 사용) */
export const categoryIdToKey = (id) => BY_ID[id]?.key;

/** 0 -> "관광지" */
export const categoryIdToName = (id) => BY_ID[id]?.name;

/**
 * 테마 목록을 카테고리 단계별로 그룹핑한다.
 * 응답에 없는 카테고리도 빈 배열로 유지해 단계 인덱스가 밀리지 않게 한다.
 *
 * @param {Array<{preferredThemeId:number, preferredThemeName:string, category:string}>} themeList
 * @returns {{categories: Array<{id:number,name:string,key:string}>, keywordsByStep: Array<Array>}}
 */
export const groupThemesByCategory = (themeList) => {
  const keywordsByStep = THEME_CATEGORIES.map(() => []);

  (themeList || []).forEach((item) => {
    const id = categoryKeyToId(item?.category);
    if (id === undefined) return; // 미지의 카테고리는 조용히 제외
    keywordsByStep[id].push(item);
  });

  return { categories: [...THEME_CATEGORIES], keywordsByStep };
};

/**
 * 선택된 테마를 PATCH /api/user/preferredThemes의 요청 본문 형태로 바꾼다.
 * 백엔드 ChangePreferredThemesRequest는 Map<PreferredThemeCategory, List<Integer>>를 받는다.
 * 예: { ATTRACTION: [1, 2], ACCOMMODATION: [12] }
 *
 * @param {Object<number, Array>} selectedByCategoryId 단계 인덱스 -> 선택된 테마 배열
 */
export const toThemeUpdatesPayload = (selectedByCategoryId) => {
  const themeUpdates = {};

  THEME_CATEGORIES.forEach(({ id, key }) => {
    const ids = (selectedByCategoryId?.[id] || [])
      .filter((t) => t && t.preferredThemeId !== -1)
      .map((t) => t.preferredThemeId);
    // 카테고리를 비우는 것도 유효한 변경이므로 빈 배열도 함께 보낸다
    themeUpdates[key] = ids;
  });

  return themeUpdates;
};
