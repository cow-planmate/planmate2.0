import { Loader2, MapPin, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { searchPlaces, type PlaceSuggestion } from '../../../../api/placeApi';

interface PlaceSearchInputProps {
  /** 선택된 장소명 (또는 직접 입력한 문자열) */
  value: string;
  onChange: (value: string) => void;
  /** 목록에서 장소를 고르면 부가 정보까지 넘긴다. 직접 입력으로 되돌아가면 null */
  onSelect: (place: PlaceSuggestion | null) => void;
  /** 지금 선택된 장소 — 주소 표시와 "고른 상태" 판단에 쓴다 */
  selected: PlaceSuggestion | null;
  placeholder?: string;
}

/**
 * 카카오 로컬 검색 자동완성 입력.
 *
 * 검색 결과를 고르면 주소·좌표까지 함께 저장돼 상세 페이지에서 지도를 띄울 수 있다.
 * 다만 검색에 안 잡히는 장소(신규 개업, 노점)도 있어서 **직접 입력도 그대로 허용한다** —
 * 목록에서 고르는 것을 강제하면 그런 장소는 글을 아예 못 쓴다.
 */
export const PlaceSearchInput = ({ value, onChange, onSelect, selected, placeholder }: PlaceSearchInputProps) => {
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  // 응답이 도착한 순서가 입력 순서와 다를 수 있다. 마지막 질의가 아니면 결과를 버린다
  const latestQuery = useRef('');
  // 방금 고른 장소명 — 그 이름이 입력칸에 들어가면서 같은 검색이 또 나가 목록이 도로 열린다
  const justPicked = useRef<string | null>(null);

  useEffect(() => {
    const q = value.trim();
    latestQuery.current = q;
    if (justPicked.current === q) {
      justPicked.current = null;
      return;
    }
    if (q.length < 2) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }
    // 한 글자 칠 때마다 부르면 카카오 쿼터를 그대로 태운다
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const found = await searchPlaces(q);
        if (latestQuery.current !== q) return;
        setResults(found);
        setError(null);
        setHighlight(0);
        setIsOpen(true);
      } catch (e) {
        if (latestQuery.current !== q) return;
        setResults([]);
        setError((e as Error).message || '장소 검색에 실패했습니다.');
        setIsOpen(true);
      } finally {
        if (latestQuery.current === q) setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // 바깥을 누르면 닫는다. 목록이 열린 채로 남으면 아래 본문을 가린다
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const pick = (place: PlaceSuggestion) => {
    justPicked.current = place.name.trim();
    onChange(place.name);
    onSelect(place);
    setIsOpen(false);
    setResults([]);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[highlight]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={boxRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="min-w-0 flex-1">
          <input
            type="text"
            placeholder={placeholder ?? '장소 검색 (예: 카페 델문도)'}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              // 고른 뒤 글자를 고치면 더 이상 그 장소가 아니다. 주소·좌표를 함께 버린다
              if (selected) onSelect(null);
            }}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            onKeyDown={onKeyDown}
            className="bg-transparent text-sm font-medium focus:outline-none w-full"
          />
          {selected?.address && (
            <p className="text-[12px] text-gray-500 truncate">{selected.address}</p>
          )}
        </div>
        {isLoading && <Loader2 className="w-4 h-4 text-gray-300 animate-spin shrink-0" />}
        {value && !isLoading && (
          <button
            type="button"
            aria-label="장소 지우기"
            onClick={() => { onChange(''); onSelect(null); setResults([]); setIsOpen(false); }}
            className="shrink-0 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-72 overflow-y-auto">
          {error ? (
            <p className="px-4 py-3 text-[13px] text-red-500">{error}</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-gray-400">
              검색 결과가 없습니다. 적어 두신 이름 그대로 저장됩니다.
            </p>
          ) : (
            results.map((place, i) => (
              <button
                key={place.id}
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => pick(place)}
                className={`w-full text-left px-4 py-2.5 border-b border-gray-50 last:border-0 ${i === highlight ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-[14px] font-bold text-[#16181d] truncate">{place.name}</span>
                  {place.category && (
                    <span className="text-[11px] text-gray-400 truncate shrink-0 max-w-[40%]">
                      {place.category.split('>').pop()?.trim()}
                    </span>
                  )}
                </div>
                {place.address && <p className="text-[12px] text-gray-500 truncate">{place.address}</p>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
