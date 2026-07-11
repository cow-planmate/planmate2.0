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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTimes } from "@fortawesome/free-solid-svg-icons";

export const ResizableScheduledItem = ({ item, onResizeEnd }) => {
  const client = getClient();
  const { eventId } = usePlanStore();
  const { SLOT_HEIGHT, TOTAL_SLOTS, timetables, selectedDay } = useTimetableStore();
  const { deleteItem, updateItemMemo } = useItemsStore();
  const [isResizing, setIsResizing] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  
  const place = item?.place;
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

  const onResizeStart = () => setIsResizing(true);

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

  const tripCategory = {
    0: "관광지",
    1: "숙소",
    2: "식당",
    3: "직접 추가",
    4: "검색",
  };
  const tripColor1 = {
    0: "bg-lime-50",
    1: "bg-orange-50",
    2: "bg-blue-50",
    3: "bg-violet-50",
    4: "bg-gray-50",
  };
  const tripColor2 = {
    0: "bg-lime-100",
    1: "bg-orange-100",
    2: "bg-blue-100",
    3: "bg-violet-100",
    4: "bg-gray-100",
  };
  const tripColor3 = {
    0: "border-lime-500",
    1: "border-orange-500",
    2: "border-blue-500",
    3: "border-violet-500",
    4: "border-gray-500",
  };
  const tripColor4 = {
    0: "text-lime-600",
    1: "text-orange-600",
    2: "text-blue-600",
    3: "text-violet-600",
    4: "text-gray-600",
  };
  const tripColor5 = {
    0: "text-lime-900",
    1: "text-orange-900",
    2: "text-blue-900",
    3: "text-violet-900",
    4: "text-gray-900",
  };

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
            className={`w-full h-full ${tripColor1[place.categoryId]} border-l-4 ${tripColor3[place.categoryId]} rounded shadow-sm overflow-hidden select-none hover:${tripColor2[place.categoryId]} transition-colors cursor-move
              ${isDragging ? "shadow-xl ring-2 ring-blue-300" : ""}
              ${localState.height <= 80 ? "flex flex-col items-start justify-center px-5" : "p-5"}`}
          >
            <div className="w-full flex items-center gap-2 min-w-0">
              <div className="flex-1 min-w-0">
                <div
                  className={`font-bold text-lg ${tripColor5[place.categoryId]} truncate pointer-events-none`}
                >
                  {place.name}
                </div>

                <div
                  className={`text-xs ${tripColor4[place.categoryId]} font-medium pointer-events-none`}
                >
                  <p>
                    {tripCategory[place.categoryId]} | {formatTime(item.start)} -{" "}
                    {formatTime(
                      item.start + Math.round(localState.height / SLOT_HEIGHT),
                    )}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-1 mt-[-4px]">
                <button
                  className={`w-7 h-7 hover:bg-white hover:bg-opacity-50 rounded-full ${tripColor5[place.categoryId]} text-xs pointer-events-auto flex items-center justify-center transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDetailOpen(true);
                  }}
                  title="수정"
                >
                  <FontAwesomeIcon icon={faPencilAlt} />
                </button>
                <button
                  className={`w-7 h-7 hover:bg-white hover:bg-opacity-50 rounded-full ${tripColor5[place.categoryId]} text-sm pointer-events-auto flex items-center justify-center transition-colors`}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id, getTimeTableId(timetables, selectedDay));
                    const block = exportBlock(getTimeTableId(timetables, selectedDay), place, item.start, item.duration, item.id);
                    sendWebsocket(block);
                  }}
                  title="삭제"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            {item.memo && localState.height > 80 && (
              <div className="mt-2 text-xs text-black line-clamp-2 pointer-events-none">
                {item.memo}
              </div>
            )}
          </div>
        </Resizable>
      </div>
      <DetailPopup 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        item={item} 
        onUpdateMemo={handleUpdateMemo}
      />
    </>
  );
};
