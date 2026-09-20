import React from 'react';
import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";
import type { RegionMarker } from '../hooks/useRegionMarkers';

interface MainFeedSidebarProps {
  mapState: { center: { lat: number; lng: number }; level: number };
  onRegionSelect: (region: string) => void;
  selectedRegion: string;
  /** 지역별 게시글 수(GET /posts/regions)로 만든 지도 마커 — 게시글이 있는 모든 여행지 */
  regionMarkers: RegionMarker[];
}

export const MainFeedSidebar: React.FC<MainFeedSidebarProps> = ({
  mapState,
  onRegionSelect,
  selectedRegion,
  regionMarkers,
}) => {
  return (
    <div className="space-y-5 xl:sticky xl:top-[94px]">
      {/* 여행지 지도 */}
      <div className="overflow-hidden rounded-[18px] border border-[#d9dce2] bg-white">
        <div className="px-6 py-5">
          <h3 className="text-[20px] font-extrabold text-[#111318]">여행지 지도</h3>
        </div>

        <div className="relative z-0 h-[250px] overflow-hidden border-t border-[#eef0f3] bg-[#f2f2f4] sm:h-[280px] xl:h-[250px]">
          <Map
            center={mapState.center}
            level={mapState.level}
            style={{ width: '100%', height: '100%' }}
            draggable={true}
            zoomable={true}
          >
            {regionMarkers.map((loc) => (
              <CustomOverlayMap
                key={loc.name}
                position={{ lat: loc.lat, lng: loc.lng }}
                yAnchor={1.2}
              >
                <div
                  className={`group/marker cursor-pointer transition-all ${selectedRegion === loc.name ? 'scale-110' : ''}`}
                  onClick={() => onRegionSelect(loc.name)}
                >
                  <div className={`relative px-3 py-1.5 rounded-full shadow-lg border transition-all transform hover:-translate-y-1 flex items-center gap-2 ${selectedRegion === loc.name
                    ? 'bg-[#1344FF] border-[#1344FF] text-white'
                    : 'bg-white border-[#e5e7eb] hover:border-[#1344FF] text-[#1a1a1a]'
                    }`}>
                    <span className="text-xs font-bold whitespace-nowrap">{loc.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${selectedRegion === loc.name ? 'bg-white/20 text-white' : 'bg-[#f0f4ff] text-[#1344FF]'
                      }`}>
                      {loc.count}
                    </span>
                    <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 border-r border-b rotate-45 ${selectedRegion === loc.name ? 'bg-[#1344FF] border-[#1344FF]' : 'bg-white border-[#e5e7eb]'
                      }`} />
                  </div>
                </div>
              </CustomOverlayMap>
            ))}
          </Map>
        </div>

      </div>
    </div>
  );
};
