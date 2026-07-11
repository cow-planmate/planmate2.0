import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ResizableScheduledItem } from './ResizableScheduledItem';
import usePlanStore from '../../../store/Plan';
import useTimetableStore from "../../../store/Timetables";
import { formatTime, getTimeTableId } from "../../../utils/createUtils";
import Weather from '../../common/Weather';

const TimetableGrid = React.forwardRef(({ items, preview, onResizeEnd, showTimetable }, ref) => {
  const { travelCategoryName, travelName, travelId } = usePlanStore();
  const { TOTAL_SLOTS, SLOT_HEIGHT, selectedDay, timetables } = useTimetableStore();
  const { setNodeRef } = useDroppable({ id: 'timetable-area' });
  // ref merge (for scrolling calculation in parent)
  const combinedRef = (node) => {
    setNodeRef(node);
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <div className={`flex-1 md:w-[36%] md:flex-initial flex flex-col md:border md:border-gray-300 rounded-lg transition-all duration-300 ${showTimetable ? 'opacity-100 z-10' : 'opacity-0 absolute inset-0 -z-10'}`}>
      <Weather
        timetables={timetables}
        selectedDay={selectedDay}
        travelCategoryName={travelCategoryName}
        travelName={travelName}
        travelId={travelId}
      />
      <div className="h-full flex flex-col overflow-hidden relative py-4 px-5 overflow-y-auto overflow-x-hidden">
        <div className="md:hidden block py-1">
          <div className="h-10"></div>
        </div>
        <div ref={combinedRef} className="flex-1 relative">
          {/* Grid Lines */}
          {Array.from({ length: TOTAL_SLOTS }).map((_, i) => (
            <div key={i} className="flex items-center box-border" style={{ height: SLOT_HEIGHT }}>
              <div className="w-12 text-center pr-3 text-xs text-gray-500">{formatTime(i)}</div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          ))}
          {/* Last Time Slot Label */}
          <div className="h-10">
            <div className="flex items-center box-border" style={{ height: SLOT_HEIGHT }}>
              <div className="w-12 text-center pr-3 text-xs text-gray-500">{formatTime(TOTAL_SLOTS)}</div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>

          {/* Ghost Block (Preview) */}
          {preview && (
            <div
              className={`absolute left-16 right-2 rounded-lg border-2 border-dashed z-20 pointer-events-none transition-all duration-75 flex items-center justify-center
                ${preview.isValid ? 'bg-blue-50 border-blue-400 text-blue-500' : 'bg-red-50 border-red-400 text-red-500'}`}
              style={{ top: 20 + preview.y, height: preview.height - 4 }}
            >
              <span className="font-bold text-sm bg-white/80 px-2 py-1 rounded shadow-sm">
                {preview.isValid ? `${preview.timeText} 배치` : '공간 부족'}
              </span>
            </div>
          )}

          <div className="block md:hidden h-12"></div>
          {/* Items */}
          {(items[getTimeTableId(timetables, selectedDay)] || []).map(item => (
            <ResizableScheduledItem key={item.id} item={item} onResizeEnd={onResizeEnd} />
          ))}
        </div>
      </div>
    </div>
  );
});

export default TimetableGrid;