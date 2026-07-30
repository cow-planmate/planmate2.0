import { MapPin, Navigation } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CustomOverlayMap, Map, Polyline } from 'react-kakao-maps-sdk';

interface RoutePreviewProps {
  route: Array<{ lat: number; lng: number; name: string }>;
  title: string;
}

export const RoutePreview: React.FC<RoutePreviewProps> = ({ route, title }) => {
  const [map, setMap] = useState<any>(null);

  // 경로 전체가 보이도록 bounds 자동 맞춤 (Complete / 상세 일정 지도와 동일)
  useEffect(() => {
    if (!map || !route?.length || !window.kakao?.maps) return;
    const bounds = new window.kakao.maps.LatLngBounds();
    route.forEach(p => bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)));
    map.setBounds(bounds);
  }, [map, route]);

  if (!route || route.length === 0) return null;

  // Calculate center of the route
  const avgLat = route.reduce((sum, p) => sum + p.lat, 0) / route.length;
  const avgLng = route.reduce((sum, p) => sum + p.lng, 0) / route.length;

  return (
    <div className="absolute top-0 left-[calc(100%+16px)] w-[320px] h-[320px] bg-white rounded-2xl shadow-2xl border-2 border-[#1344FF] z-50 overflow-hidden animate-in slide-in-from-left-2 fade-in duration-200">
      <div className="absolute top-0 left-0 right-0 bg-[#1344FF] text-white px-4 py-2 flex items-center gap-2 z-10">
        <Navigation className="w-4 h-4" />
        <span className="text-xs font-bold truncate">{title} 동선</span>
      </div>

      <Map
        center={{ lat: avgLat, lng: avgLng }}
        level={8}
        style={{ width: '100%', height: '100%' }}
        draggable={false}
        zoomable={false}
        disableDoubleClick={true}
        disableDoubleClickZoom={true}
        onCreate={setMap}
      >
        {route.slice(0, -1).map((pos, idx) => (
          <Polyline
            key={`polyline-${idx}`}
            path={[
              { lat: pos.lat, lng: pos.lng },
              { lat: route[idx + 1].lat, lng: route[idx + 1].lng },
            ]}
            strokeWeight={4}
            strokeColor={'#1344FF'}
            strokeOpacity={0.5}
            strokeStyle={'arrow'}
            endArrow={true}
          />
        ))}
        {route.map((p, i) => (
          <CustomOverlayMap
            key={i}
            position={{ lat: p.lat, lng: p.lng }}
          >
            {/* 미리보기(320px)라 말풍선 대신 압축된 형태지만, 색/번호 배지는 상세 지도와 동일 */}
            <div className="flex items-center gap-1 bg-white px-1.5 py-1 rounded-lg shadow-sm border border-gray-100">
              <div className="w-[18px] h-[18px] shrink-0 border border-main text-main text-[10px] font-semibold rounded-full flex items-center justify-center">
                {i + 1}
              </div>
              <p className="text-[10px] font-semibold text-gray-800 whitespace-nowrap max-w-[90px] truncate">{p.name}</p>
            </div>
          </CustomOverlayMap>
        ))}
      </Map>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 shadow-lg z-10 flex items-center gap-2">
        <MapPin className="w-3 h-3 text-[#1344FF]" />
        <span className="text-[10px] font-bold text-[#1344FF]">전체 {route.length}개 장소</span>
      </div>
    </div>
  );
};

