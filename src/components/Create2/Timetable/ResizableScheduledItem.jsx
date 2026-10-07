import React, { useState, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Resizable } from "react-resizable";
import { CSS } from "@dnd-kit/utilities";
import ResizeHandle from "./ResizeHandle";
import useTimetableStore from "../../../store/Timetables";
import { exportBlock, formatTime, getTimeTableId } from "../../../utils/createUtils";
import { getClient } from '../../../websocket/client';
import useItemsStore from '../../../store/Schedules';
import usePlanStore from '../../../store/Plan';
import { useSearchParams } from 'react-router-dom';
import DetailPopup from "./DetailPopup";
import PlaceDetailModal from "../Place/PlaceDetailModal";
import { PlaceActionButtons } from "../../common/PlaceActionButtons";
import {
  BedDouble,
  Clock3,
  Landmark,
  PenLine,
  Search,
  Sparkles,
  StickyNote,
  Utensils,
  X,
} from "lucide-react";

const PLACE_DETAIL_CATEGORY_IDS = new Set([0, 1, 2]);

const CATEGORY_STYLES = {
  0: {
    label: "관광지",
    Icon: Landmark,
    accent: "bg-emerald-500",
    border: "border-emerald-200/90",
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    badge: "bg-emerald-50 text-emerald-700",
  },
  1: {
    label: "숙소",
    Icon: BedDouble,
    accent: "bg-orange-500",
    border: "border-orange-200/90",
    icon: "bg-orange-50 text-orange-700 ring-orange-100",
    badge: "bg-orange-50 text-orange-700",
  },
  2: {
    label: "식당",
    Icon: Utensils,
    accent: "bg-sky-500",
    border: "border-sky-200/90",
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
    badge: "bg-sky-50 text-sky-700",
  },
  3: {
    label: "직접 추가",
    Icon: Sparkles,
    accent: "bg-violet-500",
    border: "border-violet-200/90",
    icon: "bg-violet-50 text-violet-700 ring-violet-100",
    badge: "bg-violet-50 text-violet-700",
  },
  4: {
    label: "검색",
    Icon: Search,
    accent: "bg-slate-500",
    border: "border-slate-200",
    icon: "bg-slate-100 text-slate-600 ring-slate-200",
    badge: "bg-slate-100 text-slate-600",
  },
};

export const ResizableScheduledItem = ({ item, onResizeEnd }) => {
  const client = getClient();
  const { eventId } = usePlanStore();
  const { SLOT_HEIGHT, TOTAL_SLOTS, timetables, selectedDay } = useTimetableStore();
  const { deleteItem, updateItemMemo } = useItemsStore();
  const [isResizing, setIsResizing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPlaceDetailOpen, setIsPlaceDetailOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  
  const place = item?.place;
  const categoryId =
    Number.isInteger(Number(place?.categoryId)) &&
    Number(place.categoryId) >= 0 &&
    Number(place.categoryId) <= 4
      ? Number(place.categoryId)
      : 4;
  const memoDebounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (memoDebounceRef.current) clearTimeout(memoDebounceRef.current);
    };
  }, []);

  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: item.id,
      data: { type: "schedule", ...item },
      disabled: isResizing,
    });

  const [localState, setLocalState] = useState({
    height: item.duration * SLOT_HEIGHT,
    top: 20 + item.start * SLOT_HEIGHT,
  });

  useEffect(() => {
    if (!isResizing) {
      setLocalState({
        height: item.duration * SLOT_HEIGHT,
        top: 20 + item.start * SLOT_HEIGHT,
      });
    }
  }, [item.duration, item.start, isResizing, SLOT_HEIGHT]);

  const onResizeStart = () => {
    setIsResizing(true);
    window.dispatchEvent(
      new CustomEvent("planmate:tutorial-interaction", {
        detail: { type: "resize", active: true },
      }),
    );
  };

  const onResize = (e, { size, handle }) => {
    if (handle === "n") {
      const heightDelta = size.height - localState.height;
      setLocalState({
        height: size.height,
        top: localState.top - heightDelta,
      });
    } else {
      setLocalState((prev) => ({ ...prev, height: size.height }));
    }
  };

  const onResizeStop = (e, { size, handle }) => {
    setIsResizing(false);
    window.dispatchEvent(
      new CustomEvent("planmate:tutorial-interaction", {
        detail: { type: "resize", active: false },
      }),
    );
    const slotsChanged = Math.round(
      (size.height - item.duration * SLOT_HEIGHT) / SLOT_HEIGHT,
    );

    if (slotsChanged === 0) {
      setLocalState({
        height: item.duration * SLOT_HEIGHT,
        top: 20 + item.start * SLOT_HEIGHT,
      });
      return;
    }

    let newStart = item.start;
    let newDuration = item.duration;

    if (handle === "s") {
      newDuration = item.duration + slotsChanged;
    } else if (handle === "n") {
      const finalDuration = Math.round(size.height / SLOT_HEIGHT);
      const durationDiff = finalDuration - item.duration;
      newStart = item.start - durationDiff;
      newDuration = finalDuration;
    }

    onResizeEnd(item, newStart, newDuration);
  };

  const dragStyle =
    transform && !isResizing
      ? {
          transform: CSS.Translate.toString(transform),
          zIndex: 999,
          opacity: 0.8,
        }
      : { zIndex: 10 };

  const isMinimized = localState.height <= SLOT_HEIGHT;
  const isCompact = localState.height < SLOT_HEIGHT * 2.5;
  const canShowPlaceDetail = Boolean(
    place?.placeId != null && PLACE_DETAIL_CATEGORY_IDS.has(categoryId),
  );
  const categoryStyle = CATEGORY_STYLES[categoryId] || CATEGORY_STYLES[4];
  const CategoryIcon = categoryStyle.Icon;
  const endTime = formatTime(
    item.start + Math.round(localState.height / SLOT_HEIGHT),
  );
  const actionButtonClass = "flex size-7 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#1344FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1344FF]/30";

  const sendWebsocket = (block, action = "delete") => {
    if (client && client.connected) {
      const msg = {
        eventId: eventId,
        action: action,
        entity: "timetableplaceblock",
        timeTablePlaceBlockDtos: [
          block
        ]
      };
      client.publish({
        destination: `/app/${id}`,
        body: JSON.stringify(msg),
      });
      console.log("🚀 메시지 전송:", msg);
    }
  }

  const handleUpdateMemo = (newMemo) => {
    // 1. 즉시 로컬 스토어 업데이트 (사용자 경험 유지)
    updateItemMemo(getTimeTableId(timetables, selectedDay), item.id, newMemo);
    
    // 2. 웹소켓 전송 디바운스 (서버 부하 감소: 500ms 대기)
    if (memoDebounceRef.current) clearTimeout(memoDebounceRef.current);
    
    memoDebounceRef.current = setTimeout(() => {
      const block = exportBlock(
        getTimeTableId(timetables, selectedDay), 
        place, 
        item.start, 
        item.duration, 
        item.id, 
        false, 
        null, 
        newMemo
      );
      sendWebsocket(block, "update");
    }, 500);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={{
          top: localState.top,
          height: localState.height,
          position: "absolute",
          left: "4rem",
          right: "8px",
          ...dragStyle,
        }}
        className="absolute touch-none"
        {...attributes}
      >
        <Resizable
          height={localState.height}
          width={200}
          axis="y"
          resizeHandles={["s", "n"]}
          onResizeStart={onResizeStart}
          onResize={onResize}
          onResizeStop={onResizeStop}
          minConstraints={[100, SLOT_HEIGHT]}
          maxConstraints={[100, SLOT_HEIGHT * TOTAL_SLOTS]}
          handle={(h, ref) => <ResizeHandle ref={ref} handleAxis={h} />}
        >
          <div
            {...listeners}
            className={`group/schedule relative h-full w-full cursor-move select-none overflow-hidden rounded-xl border bg-white shadow-[0_3px_12px_rgba(15,23,42,0.09)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.13)] ${categoryStyle.border}
              ${isDragging ? "scale-[1.015] border-blue-300 shadow-[0_14px_30px_rgba(19,68,255,0.22)] ring-2 ring-[#1344FF]/20" : ""}`}
          >
            <span className={`absolute inset-y-0 left-0 w-1 ${categoryStyle.accent}`} />

            <div className={`flex h-full min-w-0 items-center gap-2.5 pl-3.5 pr-[7.75rem] ${isCompact ? 'py-1.5' : 'py-3'}`}>
              <span className={`relative flex shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ${categoryStyle.icon} ${isMinimized ? 'size-7' : 'size-9'}`}>
                <CategoryIcon className={isMinimized ? 'size-3.5' : 'size-4'} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1 pointer-events-none">
                <div className={`truncate font-bold tracking-[-0.015em] text-slate-900 ${isMinimized ? 'text-sm leading-7' : 'text-[15px] leading-5'}`}>
                  {place.name}
                </div>

                {!isMinimized && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {!isCompact && (
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${categoryStyle.badge}`}>
                        {categoryStyle.label}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular-nums text-slate-500">
                      <Clock3 className="size-3" aria-hidden="true" />
                      {formatTime(item.start)}–{endTime}
                    </span>
                  </div>
                )}

                {item.memo && !isCompact && (
                  <div className="mt-2 flex max-w-full items-start gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] leading-4 text-slate-600">
                    <StickyNote className="mt-0.5 size-3 shrink-0 text-slate-400" aria-hidden="true" />
                    <span className="line-clamp-2">{item.memo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-xl bg-white/80 p-0.5 backdrop-blur-sm">
                <PlaceActionButtons
                  place={place}
                  className="flex-nowrap gap-1"
                  buttonClassName={actionButtonClass}
                  onShowDetail={canShowPlaceDetail ? () => setIsPlaceDetailOpen(true) : undefined}
                />
                <button
                  type="button"
                  className={actionButtonClass}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}
                  title="메모 수정"
                  aria-label={`${place.name} 메모 수정`}
                >
                  <PenLine className="size-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${actionButtonClass} hover:border-red-200 hover:bg-red-50 hover:text-red-600`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id, getTimeTableId(timetables, selectedDay));
                    const block = exportBlock(getTimeTableId(timetables, selectedDay), place, item.start, item.duration, item.id);
                    sendWebsocket(block);
                  }}
                  title="삭제"
                  aria-label={`${place.name} 일정에서 삭제`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
            </div>
          </div>
        </Resizable>
      </div>
      <DetailPopup 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        item={item} 
        onUpdateMemo={handleUpdateMemo}
      />
      {isPlaceDetailOpen ? (
        <PlaceDetailModal
          contentId={place.placeId}
          fallbackPlace={place}
          onClose={() => setIsPlaceDetailOpen(false)}
        />
      ) : null}
    </>
  );
};
