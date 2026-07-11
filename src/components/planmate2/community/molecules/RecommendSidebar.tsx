import { Clock, Heart, MapPin, ThumbsUp } from 'lucide-react';

interface RecommendSidebarProps {
  author: string;
  likes: number;
}

export const RecommendSidebar = ({ author, likes }: RecommendSidebarProps) => {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-red-500" />
        위치 정보
      </h3>
      <div className="bg-white rounded-xl h-40 border border-gray-200 mb-4 flex items-center justify-center text-gray-400 text-xs text-center p-4">
        지도 API 호출 영역<br/>(장소의 정확한 위치 표시)
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>영업시간: 10:00 ~ 21:00</span>
        </div>
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
