import { MapPin, Navigation } from 'lucide-react';
import React from 'react';
import { CustomOverlayMap, Map, Polyline } from 'react-kakao-maps-sdk';

interface RoutePreviewProps {
  route: Array<{ lat: number; lng: number; name: string }>;
  title: string;
}

export const RoutePreview: React.FC<RoutePreviewProps> = ({ route, title }) => {
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
      >
        <Polyline
          path={[route.map(p => ({ lat: p.lat, lng: p.lng }))]}
          strokeWeight={4}
          strokeColor="#1344FF"
          strokeOpacity={0.8}
          strokeStyle="solid"
        />
        {route.map((p, i) => (
          <CustomOverlayMap
            key={i}
            position={{ lat: p.lat, lng: p.lng }}
          >
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border-2 border-white ${i === 0 ? 'bg-[#1344FF] text-white' :
                  i === route.length - 1 ? 'bg-red-500 text-white' :
                    'bg-white text-[#1344FF]'
                }`}>
                {i + 1}
              </div>
              <div className="mt-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                <p className="text-[9px] font-bold text-gray-800 whitespace-nowrap">{p.name}</p>
              </div>
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

