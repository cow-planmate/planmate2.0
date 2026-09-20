const NAVER_MAP_SEARCH_BASE_URL = "https://map.naver.com/p/search/";

type PlaceLike = object | null | undefined;

const asRecord = (place: PlaceLike): Record<string, unknown> =>
  (place ?? {}) as Record<string, unknown>;

const firstText = (...values: unknown[]): string => {
  const value = values.find(
    (candidate) => typeof candidate === "string" && candidate.trim(),
  );
  return typeof value === "string" ? value.trim() : "";
};

export const getPlaceContentId = (place: PlaceLike): string | null => {
  if (!place) return null;
  const record = asRecord(place);
  const value =
    record.contentId ?? record.placeId ?? record.placeContentId ?? record.id;
  if (value == null) return null;
  const normalized = String(value).trim();
  return normalized || null;
};

export const getPlaceTitle = (place: PlaceLike): string =>
  place
    ? firstText(
        asRecord(place).title,
        asRecord(place).name,
        asRecord(place).placeName,
        asRecord(place).place,
      )
    : "";

export const getPlaceAddress = (place: PlaceLike): string =>
  place
    ? firstText(
        asRecord(place).addr1,
        asRecord(place).formatted_address,
        asRecord(place).placeAddress,
        asRecord(place).address,
        asRecord(place).description,
      )
    : "";

/**
 * 추천/검색 API가 준 링크를 우선 사용하고, 없으면 Tourdata 서버와 같은 규칙으로
 * 장소명 + 주소를 네이버 지도 검색 URL로 조합한다.
 */
export const buildNaverMapUrl = (place: PlaceLike): string | null => {
  if (!place) return null;

  const record = asRecord(place);
  const providedUrl = firstText(record.naverMapUrl, record.url);
  if (/^https:\/\/map\.naver\.com\//i.test(providedUrl)) return providedUrl;

  const title = getPlaceTitle(place);
  if (!title) return null;

  const address = getPlaceAddress(place);
  const query = address ? `${title} ${address}` : title;
  return `${NAVER_MAP_SEARCH_BASE_URL}${encodeURIComponent(query)}`;
};

export const isTourPlaceContentId = (place: PlaceLike): boolean => {
  const contentId = getPlaceContentId(place);
  return contentId != null && /^\d+$/.test(contentId);
};
