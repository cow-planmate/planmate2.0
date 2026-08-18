/**
 * 장소 검색 (Backend-v2 `/api/place`).
 *
 * 커뮤니티가 아니라 메인 백엔드에 있다 — 장소 도메인의 주인이 그쪽이고,
 * 일정 생성 화면도 같은 검색을 쓰게 되기 때문이다.
 */
const BASE_URL: string = (import.meta as any).env.VITE_API_URL;

/** 검색 결과 한 건 — 서버가 카카오 응답을 추려서 내려준 형태 */
export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string | null;
  /** 지번 주소 — address(도로명)가 없는 옛 건물 대비 */
  jibunAddress: string | null;
  phone: string | null;
  category: string | null;
  url: string | null;
  lat: number | null;
  lng: number | null;
}

export const searchPlaces = async (query: string, size = 10): Promise<PlaceSuggestion[]> => {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(`${BASE_URL}/api/place/search?query=${encodeURIComponent(q)}&size=${size}`);
  if (!res.ok) {
    // 서버가 내려주는 안내 메시지를 그대로 보여준다 (키 미설정 등 원인이 그 안에 있다)
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? '장소 검색에 실패했습니다.');
  }
  const body = await res.json();
  return body.places ?? [];
};
