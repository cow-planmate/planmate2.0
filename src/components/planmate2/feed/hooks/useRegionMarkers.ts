import { useEffect, useMemo, useState } from 'react';
import type { RegionCount } from '../../community/api/communityApi';
import { getRegionCoords, regionColor } from '../utils/region';

export interface RegionMarker {
  name: string;
  count: number;
  lat: number;
  lng: number;
  color: string;
}

declare const kakao: any;

/**
 * 지역별 게시글 수(GET /posts/regions) → 지도 마커 목록.
 * 좌표 테이블에 없는 지역은 카카오 주소 검색으로 한 번만 보완하고 결과를 캐시한다.
 */
export const useRegionMarkers = (regionCounts: RegionCount[] | undefined): RegionMarker[] => {
  // 조회 실패한 지역도 null로 기록해 매번 재요청하지 않는다
  const [geocoded, setGeocoded] = useState<Record<string, { lat: number; lng: number } | null>>({});
  const [sdkTick, setSdkTick] = useState(0);

  const counts = useMemo(
    () => (regionCounts ?? []).filter(rc => rc.region && rc.count > 0),
    [regionCounts],
  );

  // 좌표를 모르는 지역만 지오코딩 (services 라이브러리는 useKakaoLoader에서 로드)
  useEffect(() => {
    const unknown = counts
      .map(rc => rc.region)
      .filter(region => !getRegionCoords(region) && !(region in geocoded));
    if (unknown.length === 0) return;
    // SDK가 아직 로드되지 않았으면 잠시 후 다시 시도한다
    if (typeof kakao === 'undefined' || !kakao.maps?.services) {
      const retry = setTimeout(() => setSdkTick(tick => tick + 1), 500);
      return () => clearTimeout(retry);
    }

    let cancelled = false;
    const geocoder = new kakao.maps.services.Geocoder();

    unknown.forEach(region => {
      geocoder.addressSearch(region, (result: any[], status: string) => {
        if (cancelled) return;
        const found = status === kakao.maps.services.Status.OK ? result?.[0] : null;
        setGeocoded(prev => ({
          ...prev,
          [region]: found ? { lat: parseFloat(found.y), lng: parseFloat(found.x) } : null,
        }));
      });
    });

    return () => { cancelled = true; };
  }, [counts, geocoded, sdkTick]);

  return useMemo(
    () => counts
      .map(rc => {
        const coords = getRegionCoords(rc.region) ?? geocoded[rc.region];
        return coords
          ? { name: rc.region, count: rc.count, ...coords, color: regionColor(rc.region) }
          : null;
      })
      .filter((marker): marker is RegionMarker => marker !== null)
      .sort((a, b) => b.count - a.count),
    [counts, geocoded],
  );
};
