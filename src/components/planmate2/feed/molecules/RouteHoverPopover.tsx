import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DayPlaces } from '../../community/api/communityApi';

interface RouteHoverPopoverProps {
  /** 호버 중인 카드의 화면 좌표 (getBoundingClientRect 결과) */
  anchor: DOMRect;
  placesByDay: DayPlaces[];
  /** 카드가 바뀌면 Day를 1일차로 되돌리기 위한 식별자 */
  postId: number;
  /** 마우스가 카드에 들어온 지점 — 카드 옆에 공간이 없을 때 여기를 기준으로 띄운다 */
  cursor: { x: number; y: number } | null;
  /** 팝업 위로 마우스가 올라오면 닫기를 취소해야 한다 (카드→팝업 이동 중 사라지지 않게) */
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const POPOVER_WIDTH = 300;
const VIEWPORT_MARGIN = 12;

/**
 * 카드 호버 시 뜨는 동선 팝업.
 *
 * - body에 포털로 그린다: 리스트 컨테이너가 overflow-hidden이라 카드 안에 그리면 잘린다.
 * - 휠을 굴리면 Day가 넘어간다 (페이지 스크롤은 막는다).
 */
export const RouteHoverPopover: React.FC<RouteHoverPopoverProps> = ({
  anchor,
  placesByDay,
  postId,
  cursor,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [dayIndex, setDayIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  // 카드가 바뀌면 항상 첫날부터 — 이전 카드에서 보던 Day가 남아 있으면 헷갈린다
  useEffect(() => {
    setDayIndex(0);
  }, [postId]);

  // 화면 밖으로 나가지 않게 위치를 잡는다.
  //
  // 카드 오른쪽에 붙이는 게 기본이지만, 리스트 뷰의 카드는 폭을 다 써서 오른쪽에 자리가 없다.
  // 그때 예전처럼 카드 왼쪽에 붙이면 팝업이 썸네일과 제목을 그대로 덮는다 → 커서 오른쪽에 띄운다.
  useLayoutEffect(() => {
    const height = boxRef.current?.offsetHeight ?? 200;
    const maxLeft = window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN;

    let left = anchor.right + 12;
    let top = anchor.top;

    if (left > maxLeft) {
      const fromCursor = (cursor?.x ?? anchor.left) + 16;
      // 커서 오른쪽도 좁으면 커서 왼쪽으로 — 어느 쪽이든 커서 기준이라 카드 내용은 가리지 않는다
      left = fromCursor > maxLeft ? (cursor?.x ?? anchor.right) - POPOVER_WIDTH - 16 : fromCursor;
      top = (cursor?.y ?? anchor.top) - 16;
    }

    left = Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft));
    top = Math.min(top, window.innerHeight - height - VIEWPORT_MARGIN);
    top = Math.max(VIEWPORT_MARGIN, top);
    setPos({ top, left });
  }, [anchor, cursor, dayIndex]);

  // 팝업 위에서 휠을 굴리면 Day가 넘어간다.
  // React onWheel은 passive로 등록돼 preventDefault가 먹지 않으므로 네이티브 리스너를 직접 단다 —
  // 안 그러면 Day도 넘어가면서 뒤 페이지까지 같이 스크롤된다.
  // 휠 가로채기는 팝업 위에서만 한다. 카드에 걸면 목록을 스크롤하려는 순간마다
  // 커서가 카드 위에 있다는 이유로 페이지가 멈춰버린다.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || placesByDay.length <= 1) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const step = e.deltaY > 0 ? 1 : -1;
      setDayIndex(prev => Math.min(placesByDay.length - 1, Math.max(0, prev + step)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [placesByDay.length]);

  const current = placesByDay[dayIndex];
  if (!current) return null;

  const remaining = current.count - current.places.length;
  const multiDay = placesByDay.length > 1;

  return createPortal(
    <div
      ref={boxRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="fixed z-[9999]"
      style={{ width: POPOVER_WIDTH, top: pos?.top ?? anchor.top, left: pos?.left ?? anchor.right + 12, visibility: pos ? 'visible' : 'hidden' }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-[#e0e2e7] overflow-hidden">
        <div className="px-3.5 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-[#1344FF]">
              Day {current.day}
              {multiDay && <span className="text-[#9aa0ab] font-medium"> / {placesByDay.length}</span>}
            </span>
            <span className="text-[11px] text-[#6b7280]">장소 {current.count}곳</span>
          </div>

          <ol className="space-y-1.5">
            {current.places.map((place, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 mt-[1px] rounded-full bg-[#eef2ff] text-[#1344FF] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span className="text-[13px] leading-[1.45] text-[#3a4150]">{place}</span>
              </li>
            ))}
            {remaining > 0 && (
              <li className="flex items-start gap-2">
                <span className="shrink-0 w-4 h-4 mt-[1px] flex items-center justify-center">
                  <MapPin className="w-3 h-3 text-[#b9bec7]" />
                </span>
                <span className="text-[12px] text-[#6b7280]">외 {remaining}곳</span>
              </li>
            )}
          </ol>
        </div>

        {/* 여러 날일 때만 스크롤 안내 — 하루짜리에 "스크롤하세요"가 뜨면 거짓말이다 */}
        {multiDay && (
          <div className="px-3.5 py-2 bg-[#f7f9ff] border-t border-[#eef0f3] flex items-center justify-between">
            <span className="text-[10px] text-[#6b7280]">스크롤로 날짜 이동</span>
            <span className="flex items-center gap-1.5">
              <ChevronUp className={`w-3.5 h-3.5 ${dayIndex > 0 ? 'text-[#1344FF]' : 'text-[#d4d7dd]'}`} />
              <span className="flex gap-1">
                {placesByDay.map((d, i) => (
                  <span
                    key={d.day}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === dayIndex ? 'bg-[#1344FF]' : 'bg-[#d4d7dd]'}`}
                  />
                ))}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 ${dayIndex < placesByDay.length - 1 ? 'text-[#1344FF]' : 'text-[#d4d7dd]'}`} />
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
