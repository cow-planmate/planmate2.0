import { useState, useRef, useEffect } from 'react';
import { useDndMonitor, DragOverlay } from '@dnd-kit/core';
import { useSearchParams } from 'react-router-dom';
import TimetableGrid from '../Timetable/TimetableGrid';
import Sidebar from '../Place/Sidebar';
import useTimetableStore from "../../../store/Timetables";
import { formatTime, checkOverlap, findEmptySlot, getTimeTableId, exportBlock } from "../../../utils/createUtils";
import { resizeStyles } from '../Timetable/ResizeHandle'; // 스타일 문자열 import
import useItemsStore from "../../../store/Schedules";
import { getClient } from '../../../websocket/client';
import usePlanStore from '../../../store/Plan';

import { faCalendar, faMapPin } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WarningToast } from '../../common/Toast';

export default function Main() {
  const client = getClient();

  const {
    items,
    getNextId,
    addItemFromDrag,
    moveItem,
    resizeItem,
    addItemMobile,
  } = useItemsStore();

  const [activeTab, setActiveTab] = useState('timetable');
  const [preview, setPreview] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const gridRef = useRef(null);

  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const { eventId } = usePlanStore();
  const { TOTAL_SLOTS, SLOT_HEIGHT, selectedDay, timetables } = useTimetableStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [touchStartPos, setTouchStartPos] = useState({ x: null, y: null });
  const [touchEndPos, setTouchEndPos] = useState({ x: null, y: null });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    console.log(items)
  }, [items])

  const sendWebsocket = (action, block) => {
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

  // --- DnD Handlers ---
  useDndMonitor({
    onDragStart(event) {
      setActiveId(event.active.id);
    },
    onDragMove(event) {
      const { active, over } = event;
      if (over && over.id === 'timetable-area' && gridRef.current) {
        const gridRect = gridRef.current.getBoundingClientRect();
        const currentY = active.rect.current?.translated
          ? active.rect.current.translated.top
          : event.activatorEvent.clientY;

        const relativeY = currentY - gridRect.top + gridRef.current.scrollTop;
        let targetSlot = Math.round(relativeY / SLOT_HEIGHT);
        const duration = active.data.current.duration || 4;

        if (targetSlot < 0) targetSlot = 0;
        if (targetSlot + duration > TOTAL_SLOTS) targetSlot = TOTAL_SLOTS - duration;

        const isOverlap = checkOverlap(targetSlot, duration, items[getTimeTableId(timetables, selectedDay)], active.data.current.type === 'schedule' ? active.id : null);

        setPreview({
          y: targetSlot * SLOT_HEIGHT,
          height: duration * SLOT_HEIGHT,
          isValid: !isOverlap,
          timeText: formatTime(targetSlot)
        });
      } else {
        setPreview(null);
      }
    },
    onDragEnd(event) {
      setPreview(null);
      setActiveId(null);

      const { active, over } = event;
      if (!over || over.id !== 'timetable-area') return;

      const gridRect = gridRef.current.getBoundingClientRect();
      const currentY = active.rect.current?.translated?.top ?? event.activatorEvent.clientY;
      const relativeY = currentY - gridRect.top + gridRef.current.scrollTop;
      let newStart = Math.round(relativeY / SLOT_HEIGHT);

      const type = active.data.current.type;
      const duration = active.data.current.duration || 4;
      const place = active.data.current.place;

      if (newStart < 0) newStart = 0;
      if (newStart + duration > TOTAL_SLOTS) newStart = TOTAL_SLOTS - duration;

      const itemId = type === 'schedule' ? active.id : null;
      if (checkOverlap(newStart, duration, items[getTimeTableId(timetables, selectedDay)], itemId)) return;

      const timeTableId = getTimeTableId(timetables, selectedDay);

      if (type === 'sidebar') {
        const blockId = getNextId(timeTableId, newStart);
        addItemFromDrag({
          timetables,
          selectedDay,
          active,
          newStart,
          duration,
          blockId,
        });
        const block = exportBlock(timeTableId, place, newStart, duration, blockId)
        sendWebsocket("create", block);
      } else if (type === 'schedule') {
        const item = active.data.current;
        moveItem({
          timetables,
          selectedDay,
          activeId: active.id,
          newStart,
        });
        const block = exportBlock(timeTableId, place, newStart, duration, active.id, false, null, item.memo)
        sendWebsocket("update", block);
      }
    }
  });

  const handleResizeEnd = (item, newStart, newDuration) => {
    const id = item.id;
    resizeItem({
      timetables,
      selectedDay,
      id,
      newStart,
      newDuration,
      TOTAL_SLOTS,
    });
    const block = exportBlock(getTimeTableId(timetables, selectedDay), item.place, newStart, newDuration, id, false, null, item.memo)
    sendWebsocket("update", block);
  };

  const handleMobileAdd = (place) => {
    const timeTableId = getTimeTableId(timetables, selectedDay);
    const emptySlot = findEmptySlot(4, items[timeTableId]);
    if (emptySlot === -1) {
      WarningToast('빈 시간이 없습니다!');
      return;
    }
    const blockId = getNextId(timeTableId, emptySlot);
    addItemMobile({
      timetables,
      selectedDay,
      place,
      emptySlot,
      blockId,
    });
    const block = exportBlock(timeTableId, place, emptySlot, 4, blockId)
    sendWebsocket("create", block);

    setActiveTab('timetable');
  };

  // --- Swipe Handlers ---
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEndPos({ x: null, y: null });
    setTouchStartPos({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e) => {
    setTouchEndPos({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStartPos.x || !touchEndPos.x) return;

    const distanceX = touchStartPos.x - touchEndPos.x;
    const distanceY = touchStartPos.y - touchEndPos.y;

    // 가로 스와이프가 세로 스크롤보다 클 때만 동작하도록 확인
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      if (isMobile) {
        if (isLeftSwipe && activeTab === 'timetable') {
          setActiveTab('recommend');
        }
        if (isRightSwipe && activeTab === 'recommend') {
          setActiveTab('timetable');
        }
      }
    }
  };

  const showTimetable = !isMobile || activeTab === 'timetable';
  const showSidebar = !isMobile || activeTab === 'recommend';

  return (
    <div
      className="flex flex-1 flex-col h-full overflow-hidden select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <style>{resizeStyles}</style>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative md:space-x-6">
        <TimetableGrid
          ref={gridRef}
          items={items}
          preview={preview}
          onResizeEnd={handleResizeEnd}
          showTimetable={showTimetable}
        />
        <Sidebar
          planId={id}
          isMobile={isMobile}
          showSidebar={showSidebar}
          handleMobileAdd={handleMobileAdd}
        />
      </div>

      {/* Mobile Bottom Tab */}
      {isMobile && (
        <nav className="fixed left-0 right-0 bottom-0 z-40 bg-white border-t h-16 flex">
          <button onClick={() => setActiveTab('timetable')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'timetable' ? 'text-main' : 'text-gray-400'}`}>
            <span className="text-xl"><FontAwesomeIcon icon={faCalendar} /></span><span className="text-xs font-medium">시간표</span>
          </button>
          <button onClick={() => setActiveTab('recommend')} className={`flex-1 flex flex-col items-center justify-center ${activeTab === 'recommend' ? 'text-main' : 'text-gray-400'}`}>
            <span className="text-xl"><FontAwesomeIcon icon={faMapPin} /></span><span className="text-xs font-medium">추천 장소</span>
          </button>
        </nav>
      )}

      {/* Global Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="p-3 bg-main text-white rounded-lg shadow-2xl w-48 opacity-90 scale-105 cursor-grabbing font-bold flex items-center justify-center">
            이동 중...
          </div>
        ) : null}
      </DragOverlay>
    </div>
  );
}