import { Heart, MapPin, ThumbsUp } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';

interface RecommendSidebarProps {
  author: string;
  likes: number;
  location?: string;
  coords?: { lat: number; lng: number };
}

export const RecommendSidebar = ({ author, likes, location, coords }: RecommendSidebarProps) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-500" />
        위치 정보
      </h3>
      {coords ? (
        <div className="rounded-xl h-40 border border-gray-200 mb-4 overflow-hidden">
          <Map center={coords} level={5} style={{ width: '100%', height: '100%' }}>
            <MapMarker position={coords} />
          </Map>
        </div>
      ) : (
        // 좌표가 없는 게시글은 지도 대신 작성자가 입력한 위치 텍스트만 노출한다
        <div className="bg-white rounded-xl h-40 border border-gray-200 mb-4 flex items-center justify-center text-gray-400 text-xs text-center p-4">
          {location ?? '등록된 위치 정보가 없습니다'}
        </div>
      )}
      <div className="space-y-4">
        {location && (
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{location}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-gray-400" />
          <span>추천인: {author}</span>
        </div>
      </div>
      
      <button className="w-full mt-6 py-3 bg-[#1344FF] text-white rounded-xl font-bold hover:bg-[#0d34cc] transition-all flex items-center justify-center gap-2 shadow-sm">
        <ThumbsUp className="w-4 h-4" />
        추천해요 ({likes})
      </button>
    </div>
  );
};
