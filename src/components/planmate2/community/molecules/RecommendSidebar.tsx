import { ExternalLink, Heart, MapPin, ThumbsUp } from 'lucide-react';
import { Map, MapMarker } from 'react-kakao-maps-sdk';
import { buildKakaoMapUrl } from '../../common/kakaoMapLink';

interface RecommendSidebarProps {
  author: string;
  likes: number;
  location?: string;
  coords?: { lat: number; lng: number };
  placeUrl?: string;
  /** 여러 곳을 담은 글이면 장소 수. 지도·링크는 본문의 장소 섹션이 맡으므로 여기선 요약만 남긴다 */
  placeCount?: number;
}

export const RecommendSidebar = ({ author, likes, location, coords, placeUrl, placeCount }: RecommendSidebarProps) => {
  const isMultiPlace = placeCount != null && placeCount > 1;
  const kakaoMapUrl = buildKakaoMapUrl({ placeUrl, location, coords });
  const openKakaoMap = () => {
    if (kakaoMapUrl) window.open(kakaoMapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 sticky top-24">
      <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        위치 정보
      </h3>
      {isMultiPlace ? (
        // 본문에 지도+목록 섹션이 이미 있다 — 같은 지도를 두 번 그리지 않는다
        <div className="bg-white rounded-xl border border-gray-200 mb-4 px-4 py-3 text-sm text-gray-600">
          이 글에 담긴 장소 <b className="text-gray-900">{placeCount}곳</b>
          <p className="text-[12px] text-gray-400 mt-0.5">본문의 지도에서 모두 볼 수 있어요</p>
        </div>
      ) : coords ? (
        <div className="rounded-xl h-40 border border-gray-200 mb-4 overflow-hidden">
          <Map center={coords} level={5} style={{ width: '100%', height: '100%' }}>
            <MapMarker position={coords} onClick={openKakaoMap} />
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

      {/* 추천해요(주 액션)와 지도 열기(보조)를 한 줄에 둔다 — 둘 다 테두리만 있는 무채색이라
          아이콘 하나만 뜬 버튼이 허공에 떠 보이지 않는다 */}
      <div className="mt-6 flex items-center gap-2">
        <button className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-sm hover:border-gray-400 transition-colors flex items-center justify-center gap-2">
          <ThumbsUp className="w-4 h-4 text-gray-400" />
          추천해요 ({likes})
        </button>
        {kakaoMapUrl && !isMultiPlace && (
          <a
            href={kakaoMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="카카오맵에서 보기"
            aria-label="카카오맵에서 보기"
            className="shrink-0 w-10 h-10 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};
