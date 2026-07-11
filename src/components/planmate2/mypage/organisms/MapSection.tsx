import { MapPin } from 'lucide-react';
import React from 'react';
import { CustomOverlayMap, Map } from 'react-kakao-maps-sdk';

interface MapSectionProps {
  allPlansCount: number;
  groupedPlansByRegion: any;
}

export const MapSection: React.FC<MapSectionProps> = ({
  allPlansCount,
  groupedPlansByRegion,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-[#1344FF]" />
          <h3 className="text-xl font-bold text-[#1a1a1a]">나의 여행 발자취</h3>
        </div>
        <div className="bg-blue-50 px-3 py-1 rounded-full">
          <span className="text-sm font-bold text-[#1344FF]">총 {allPlansCount}곳 방문</span>
        </div>
      </div>
      
      <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative">
        <Map
          center={{ lat: 36.5, lng: 127.8 }}
          style={{ width: "100%", height: "100%" }}
          level={13}
          draggable={true}
          zoomable={true}
        >
          {Object.values(groupedPlansByRegion).map((region: any) => (
            <CustomOverlayMap
              key={region.name}
              position={region.coords}
            >
              <div className="relative group">
                <div className="bg-white rounded-2xl shadow-xl border-2 border-[#1344FF] px-3 py-1.5 flex items-center gap-2 hover:scale-110 transition-transform cursor-pointer">
                  <div className="w-6 h-6 bg-[#1344FF] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {region.count}
                  </div>
                  <span className="text-sm font-bold text-gray-800">{region.name}</span>
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 bg-white rounded-xl shadow-2xl p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 mb-2 border-b pb-1">{region.name} 여행 목록</p>
                  <div className="space-y-1.5">
                    {region.plans.slice(0, 3).map((plan: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${plan.isOwner ? 'bg-blue-500' : 'bg-orange-500'}`} />
                        <p className="text-[11px] text-gray-700 truncate font-medium">{plan.planName}</p>
                      </div>
                    ))}
                    {region.plans.length > 3 && (
                      <p className="text-[10px] text-gray-400 mt-1 pl-3.5">외 {region.count - 3}개의 일정...</p>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                </div>
              </div>
            </CustomOverlayMap>
          ))}
        </Map>
      </div>
    </div>
  );
};
