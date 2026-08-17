import { ExternalLink, MapPin, Phone, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomOverlayMap, Map, MapMarker } from 'react-kakao-maps-sdk';
import { type RecommendPlace } from '../api/communityApi';
import { buildKakaoMapUrl } from '../../common/kakaoMapLink';

interface RecommendPlacesSectionProps {
  places: RecommendPlace[];
}

const hasCoords = (place: RecommendPlace): place is RecommendPlace & { lat: number; lng: number } =>
  typeof place.lat === 'number' && typeof place.lng === 'number';

/**
 * 여러 장소가 담긴 추천 글의 장소 섹션 — 지도 한 장에 전부 찍고 목록과 번호로 짝지어 보여준다.
 *
 * 목록에서 장소를 누르면 지도가 그 장소로 움직인다. 지도를 확대/이동해 찾게 하는 대신
 * "목록에서 고르면 지도가 따라온다"로 둔 것은, 이 글의 독자가 하려는 일이
 * 장소 하나하나를 훑어보는 것이기 때문이다.
 */
export const RecommendPlacesSection = ({ places }: RecommendPlacesSectionProps) => {
  const mapped = useMemo(() => places.filter(hasCoords), [places]);
  // 좌표가 있는 장소들만 지도에 올라간다. 직접 입력한 장소는 목록에만 남는다
  const [selected, setSelected] = useState(0);

  const center = mapped[Math.min(selected, mapped.length - 1)] ?? mapped[0];

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-400" />
        추천 장소 {places.length}곳
      </h2>

      {center && (
        <div className="rounded-2xl h-64 border border-gray-200 overflow-hidden mb-4">
          <Map
            center={{ lat: center.lat, lng: center.lng }}
            level={6}
            style={{ width: '100%', height: '100%' }}
            onCreate={(map) => {
              // 처음엔 담긴 장소가 모두 들어오게 맞춘다 (한 곳뿐이면 그 장소를 중심으로 둔다)
              if (mapped.length < 2) return;
              const bounds = new kakao.maps.LatLngBounds();
              mapped.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
              map.setBounds(bounds);
            }}
          >
            {mapped.map((place, index) => (
              <div key={`${place.name}-${index}`}>
                <MapMarker
                  position={{ lat: place.lat, lng: place.lng }}
                  onClick={() => setSelected(index)}
                />
                <CustomOverlayMap position={{ lat: place.lat, lng: place.lng }} yAnchor={2.2}>
                  <span className="px-2 py-0.5 rounded-full bg-white/95 border border-gray-200 text-[11px] font-bold text-gray-700 shadow-sm whitespace-nowrap">
                    {places.indexOf(place) + 1}. {place.name}
                  </span>
                </CustomOverlayMap>
              </div>
            ))}
          </Map>
        </div>
      )}

      <ol className="space-y-2">
        {places.map((place, index) => {
          const kakaoMapUrl = buildKakaoMapUrl({ placeUrl: place.url, location: place.name, coords: hasCoords(place) ? { lat: place.lat, lng: place.lng } : null });
          const mapIndex = mapped.indexOf(place as RecommendPlace & { lat: number; lng: number });
          const isSelected = mapIndex >= 0 && mapIndex === selected;
          return (
            <li
              key={`${place.name}-${index}`}
              onClick={() => mapIndex >= 0 && setSelected(mapIndex)}
              className={`rounded-xl border px-4 py-3 transition-colors ${
                isSelected ? 'border-gray-400 bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
              } ${mapIndex >= 0 ? 'cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 w-6 h-6 shrink-0 rounded-full text-[12px] font-bold flex items-center justify-center ${
                  isSelected ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-bold text-gray-900 truncate">{place.name}</span>
                    {place.rating != null && (
                      <span className="shrink-0 flex items-center gap-0.5 text-[12px] font-bold text-gray-600">
                        <Star className="w-3 h-3 fill-gray-500 text-gray-500" />
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                    {place.category && (
                      <span className="text-[11px] text-gray-400 truncate">{place.category.split('>').pop()?.trim()}</span>
                    )}
                  </div>
                  {place.address && <p className="text-[13px] text-gray-500 truncate">{place.address}</p>}
                  {place.memo && <p className="text-[13px] text-gray-700 mt-1">{place.memo}</p>}
                  {place.phone && (
                    <p className="text-[12px] text-gray-400 mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />{place.phone}
                    </p>
                  )}
                </div>
                {kakaoMapUrl && (
                  <a
                    href={kakaoMapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="카카오맵에서 보기"
                    aria-label={`${place.name} 카카오맵에서 보기`}
                    className="shrink-0 p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
