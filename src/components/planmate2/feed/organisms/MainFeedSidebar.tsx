import { Award, Clock, MapPin, Maximize2, Star, X } from 'lucide-react';
import React, { useState } from 'react';
import { CustomOverlayMap, Map } from "react-kakao-maps-sdk";

interface MainFeedSidebarProps {
  mapState: { center: { lat: number; lng: number }; level: number };
  onRegionSelect: (region: string) => void;
  selectedRegion: string;
  onNavigate: (view: any, data?: any) => void;
  posts: any[];
}

export const MainFeedSidebar: React.FC<MainFeedSidebarProps> = ({
  mapState,
  onRegionSelect,
  selectedRegion,
  onNavigate,
  posts
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const regions = [
    { name: '서울', lat: 37.5665, lng: 126.9780, color: '#1344FF' },
    { name: '부산', lat: 35.1796, lng: 129.0756, color: '#FF3B30' },
    { name: '제주도', lat: 33.4996, lng: 126.5312, color: '#34C759' }
  ];

  return (
    <div className="space-y-6">
      {/* 여행지 지도 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#1344FF]" />
            <h3 className="text-lg font-bold text-[#1a1a1a]">여행지 지도</h3>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-[#1344FF]"
            title="지도 크게 보기"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-2xl mb-4 h-80 overflow-hidden border border-[#e5e7eb] relative z-0 shadow-inner group">
          <Map
            center={mapState.center}
            level={mapState.level}
            style={{ width: '100%', height: '100%' }}
            draggable={true}
            zoomable={true}
          >
            {regions.map((loc) => {
              const count = posts.filter(p => p.destination === loc.name).length;
              return (
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
                      <div
                        className={`w-2 h-2 rounded-full ${selectedRegion === loc.name ? 'bg-white' : 'animate-pulse'}`}
                        style={selectedRegion === loc.name ? {} : { backgroundColor: loc.color }}
                      />
                      <span className="text-xs font-bold whitespace-nowrap">{loc.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${selectedRegion === loc.name ? 'bg-white/20 text-white' : 'bg-[#f0f4ff] text-[#1344FF]'
                        }`}>
                        {count}
                      </span>
                      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 border-r border-b rotate-45 ${selectedRegion === loc.name ? 'bg-[#1344FF] border-[#1344FF]' : 'bg-white border-[#e5e7eb]'
                        }`} />
                    </div>
                  </div>
                </CustomOverlayMap>
              );
            })}
          </Map>
        </div>

        <div className="space-y-2">
          {regions.map((loc) => (
            <div
              key={loc.name}
              onClick={() => onRegionSelect(loc.name)}
              className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${selectedRegion === loc.name
                ? 'bg-blue-50 border border-[#1344FF]/20 shadow-sm'
                : 'bg-[#f8f9fa] hover:bg-blue-50 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color }}></div>
                <span className={`font-medium ${selectedRegion === loc.name ? 'text-[#1344FF]' : 'text-[#1a1a1a]'}`}>{loc.name}</span>
              </div>
              <span className={`text-sm ${selectedRegion === loc.name ? 'text-[#1344FF] font-bold' : 'text-[#666666]'}`}>
                {posts.filter(p => p.destination === loc.name).length}개
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 여행 일정 생성 바로가기 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#f0f4ff] rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#1344FF]" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">나만의 여행 일정 만들기</h3>
        </div>
        <p className="text-sm text-[#666666] mb-4">날짜, 인원, 여행지만 입력하면 AI가 최적의 동선을 짜드려요!</p>
        <button
          onClick={() => onNavigate('create')}
          className="w-full bg-[#1344FF] text-white py-3 rounded-xl font-medium hover:bg-[#0d34cc] transition-colors shadow-sm"
        >
          여행 일정 생성 시작하기
        </button>
      </div>

      {/* 사용자 레벨 시스템 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#1344FF]" />
          <h3 className="text-lg font-bold text-[#1a1a1a]">사용자 레벨</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1344FF] to-[#7c3aed] rounded-full flex items-center justify-center text-white font-bold">Lv.2</div>
              <div>
                <p className="font-bold text-[#1a1a1a]">여행 애호가</p>
                <p className="text-sm text-[#666666]">50-99회 가져감</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#666666]">진행도</span>
                <span className="font-medium text-[#1344FF]">78/100회 가져감</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-[#1344FF] to-[#7c3aed] h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-blue-50 border-2 border-[#1344FF]">
              <Star className="w-4 h-4 text-[#1344FF] fill-current" />
              <p className="text-sm font-medium text-[#1344FF]">Lv.2 여행 애호가</p>
            </div>
            {/* ... other levels simplified for space ... */}
            <div className="text-center">
              <p className="text-xs text-[#666666]">다음 레벨까지 22회 남았어요!</p>
            </div>
          </div>
        </div>
      </div>
      {/* 지도 크게 보기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-[95vw] h-[95vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#1344FF]" />
                </div>
                <h2 className="text-xl font-bold text-[#1a1a1a]">전체 여행지 지도</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-all text-gray-400 hover:text-gray-900 shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Large Map */}
            <div className="w-full h-full pt-16">
              <Map
                center={mapState.center}
                level={mapState.level - 1}
                style={{ width: '100%', height: '100%' }}
              >
                {regions.map((loc) => {
                  const count = posts.filter(p => p.destination === loc.name).length;
                  return (
                    <CustomOverlayMap
                      key={`modal-${loc.name}`}
                      position={{ lat: loc.lat, lng: loc.lng }}
                      yAnchor={1.2}
                    >
                      <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-[#1344FF] flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: loc.color }} />
                        <span className="text-sm font-bold text-[#1a1a1a]">{loc.name}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-[#1344FF] text-xs font-bold rounded-full border border-blue-100">
                          {count}개 게시글
                        </span>
                      </div>
                    </CustomOverlayMap>
                  );
                })}
              </Map>
            </div>

            {/* Footer / Stats */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10">
              <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 flex items-center gap-6">
                {regions.map(loc => (
                  <div key={loc.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: loc.color }} />
                    <span className="text-sm font-bold text-gray-700">{loc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
