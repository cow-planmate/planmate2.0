import { useEffect, useState } from "react";
import { getTimeTableId } from "../../utils/createUtils";
import { ScheduledItem } from "./ScheduledItem";
import Weather from "../common/Weather";

const TimetableGrid = ({ planFrame, placeBlocks, selectedDay, timetables, showTimetable }) => {
  const travelCategoryName = planFrame?.travelCategoryName;
  const travelName = planFrame?.travelName;
  const travelId = planFrame?.travelId;

  const SLOT_HEIGHT = 40;
  const [TOTAL_SLOTS, setTotalSlots] = useState(0);
  const [START_HOUR, setStartHour] = useState(0);

  const formatTime = (slotIndex) => {
    const totalMin = slotIndex * 15 + START_HOUR * 60;
    const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const m = (totalMin % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  useEffect(() => {
    const timetable = timetables[selectedDay];
    const startHour = Number(timetable.timeTableStartTime.split(":")[0]);
    const endHour = Number(timetable.timeTableEndTime.split(":")[0]);
    setStartHour(startHour);
    setTotalSlots(((endHour - startHour) * 60) / 15);
  }, [selectedDay]);

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
        <div className="flex-1 relative">
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
          <div className="block md:hidden h-12"></div>
          {(placeBlocks[getTimeTableId(timetables, selectedDay)] || []).map(item => (
            <ScheduledItem key={item.id} item={item} START_HOUR={START_HOUR} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;