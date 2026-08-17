import { ChevronDown, ChevronUp, GripVertical, MapPin, Plus, Star, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { type PlaceSuggestion } from '../../../../api/placeApi';
import { type RecommendPlace } from '../api/communityApi';
import { PlaceSearchInput } from '../molecules/PlaceSearchInput';

interface PlaceListEditorProps {
  /** 검색창에 지금 쳐 넣은 글자 (아직 목록에 담기 전) */
  query: string;
  setQuery: (value: string) => void;
  picked: PlaceSuggestion | null;
  setPicked: (place: PlaceSuggestion | null) => void;
  places: RecommendPlace[];
  addPlace: (picked?: PlaceSuggestion | null) => void;
  removePlace: (index: number) => void;
  movePlace: (index: number, direction: -1 | 1) => void;
  /** 드래그로 옮기기 — from 을 뽑아 to 자리에 끼워 넣는다 */
  reorderPlaces: (from: number, to: number) => void;
  setPlaceMemo: (index: number, memo: string) => void;
  setPlaceRating: (index: number, rating: number) => void;
}

/** 장소별 평점 — 반 개 단위는 쓰지 않는다. 별 다섯 개를 누르는 편이 select 보다 빠르다 */
const PlaceRating = ({ value, onChange }: { value: number; onChange: (rating: number) => void }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((score) => (
      <button
        key={score}
        type="button"
        aria-label={`평점 ${score}점`}
        onClick={() => onChange(score)}
        className="p-0.5 text-gray-300 hover:text-gray-500"
      >
        <Star className={`w-4 h-4 ${score <= value ? 'fill-gray-700 text-gray-700' : ''}`} />
      </button>
    ))}
    <span className="ml-1 text-[11px] text-gray-400 tabular-nums">{value.toFixed(1)}</span>
  </div>
);

/**
 * 장소 추천 글의 장소 목록 편집기.
 *
 * 검색 결과를 고르면 곧바로 목록에 담기고 검색창은 비워진다 — "일산 카페들"처럼 여러 곳을
 * 연달아 넣는 것이 이 화면의 기본 동작이기 때문이다. 목록의 첫 번째가 대표 장소가 되어
 * 게시판 목록의 배지와 지도 초기 위치에 쓰인다.
 */
export const PlaceListEditor = ({
  query, setQuery, picked, setPicked, places, addPlace, removePlace, movePlace, reorderPlaces,
  setPlaceMemo, setPlaceRating,
}: PlaceListEditorProps) => {
  // 드래그 중인 항목의 인덱스. ref 로도 들고 있는 이유는 drop 핸들러가 "지금" 값을 읽어야 하기 때문이다 —
  // state 만 쓰면 dragstart 와 drop 이 같은 렌더 안에서 일어날 때 이전 값(null)을 보고 순서가 안 바뀐다.
  const draggingRef = useRef<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const startDrag = (index: number) => {
    draggingRef.current = index;
    setDragging(index);
  };

  const endDrag = () => {
    draggingRef.current = null;
    setDragging(null);
    setDragOver(null);
  };

  const drop = (to: number) => {
    if (draggingRef.current !== null) reorderPlaces(draggingRef.current, to);
    endDrag();
  };

  return (
    <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/60">
      <div className="flex items-center gap-3">
        <PlaceSearchInput
          value={query}
          onChange={setQuery}
          selected={picked}
          onSelect={(p) => {
            // 검색 결과를 고른 순간 바로 담는다 (한 곳만 넣는 글도 버튼을 한 번 덜 누른다)
            if (p) addPlace(p);
            else setPicked(null);
          }}
          placeholder="장소 검색 후 추가 (예: 일산 카페)"
        />
        <button
          type="button"
          onClick={() => addPlace()}
          disabled={!query.trim()}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-900 text-white disabled:bg-gray-200 disabled:text-gray-400 hover:bg-gray-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          담기
        </button>
      </div>

      {places.length === 0 ? (
        <p className="mt-3 text-[12px] text-gray-400">
          장소를 검색해 담아주세요. 여러 곳을 담으면 한 글에서 지도로 함께 볼 수 있고,
          장소마다 평점을 매기면 글 평점은 그 평균이 됩니다. 순서는 드래그로 바꿀 수 있어요.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {places.map((place, index) => (
            <li
              key={`${place.name}-${index}`}
              draggable
              onDragStart={() => startDrag(index)}
              onDragEnd={endDrag}
              onDragOver={(e) => { e.preventDefault(); setDragOver(index); }}
              onDrop={() => drop(index)}
              className={`bg-white rounded-xl border px-3 py-2.5 transition-colors ${
                dragging === index ? 'opacity-40 border-gray-300' : 'border-gray-100'
              } ${dragOver === index && dragging !== index ? 'border-gray-900' : ''}`}
            >
              <div className="flex items-start gap-2">
                {/* 손잡이는 순서를 바꿀 수 있다는 표시다 — 행 전체가 draggable 이라 여기만 잡을 필요는 없다 */}
                <GripVertical className="mt-1 w-4 h-4 shrink-0 text-gray-300 cursor-grab active:cursor-grabbing" />
                <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-gray-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[14px] font-bold text-[#16181d] truncate">{place.name}</span>
                    {index === 0 && (
                      <span className="shrink-0 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-bold">대표</span>
                    )}
                    {place.category && (
                      <span className="text-[11px] text-gray-400 truncate">{place.category.split('>').pop()?.trim()}</span>
                    )}
                  </div>
                  {place.address ? (
                    <p className="text-[12px] text-gray-500 truncate">{place.address}</p>
                  ) : (
                    // 검색으로 고르지 않은 장소는 좌표가 없어 지도에 찍히지 않는다 — 미리 알려준다
                    <p className="text-[12px] text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />직접 입력한 장소 (지도에는 표시되지 않아요)
                    </p>
                  )}
                  <div className="mt-1">
                    <PlaceRating value={place.rating ?? 0} onChange={(rating) => setPlaceRating(index, rating)} />
                  </div>
                  <input
                    type="text"
                    value={place.memo ?? ''}
                    onChange={(e) => setPlaceMemo(index, e.target.value)}
                    placeholder="이 장소 한 줄 소개 (선택)"
                    maxLength={500}
                    className="mt-1 w-full bg-transparent text-[13px] focus:outline-none placeholder:text-gray-300"
                  />
                </div>
                <div className="shrink-0 flex items-center gap-0.5">
                  <button
                    type="button"
                    aria-label="위로"
                    onClick={() => movePlace(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="아래로"
                    onClick={() => movePlace(index, 1)}
                    disabled={index === places.length - 1}
                    className="p-1 rounded text-gray-300 hover:text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="장소 빼기"
                    onClick={() => removePlace(index)}
                    className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
