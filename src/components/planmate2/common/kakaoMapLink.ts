interface KakaoMapLinkSource {
  /** 카카오 로컬 검색으로 고른 장소의 상세 페이지 URL (직접 입력한 옛 글은 없음) */
  placeUrl?: string | null;
  location?: string | null;
  coords?: { lat: number; lng: number } | null;
  /**
   * 검색으로 떨어질 때 쓸 검색어 (기본값은 location).
   * 이름만으로는 동명 장소가 많은 경우 주소를 붙여 좁히는 데 쓴다.
   */
  searchQuery?: string | null;
}

/**
 * 게시글의 장소를 카카오맵에서 열 수 있는 URL을 만든다.
 * 우선순위: 장소 상세 페이지 > 좌표 마커 > 이름 검색. 셋 다 없으면 null.
 */
export const buildKakaoMapUrl = ({ placeUrl, location, coords, searchQuery }: KakaoMapLinkSource): string | null => {
  if (placeUrl) return placeUrl;

  const name = location?.trim();
  if (coords) {
    // link/map 은 이름이 비어 있으면 마커 라벨이 깨지므로 좌표를 라벨로 대신 쓴다
    const label = encodeURIComponent(name || '추천 장소');
    return `https://map.kakao.com/link/map/${label},${coords.lat},${coords.lng}`;
  }
  const query = searchQuery?.trim() || name;
  if (query) return `https://map.kakao.com/link/search/${encodeURIComponent(query)}`;

  return null;
};
