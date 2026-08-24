import { CalendarDays, MapPin } from "lucide-react";
import { getTimeTableId } from "../../utils/createUtils";
import { ScheduledItem } from "./ScheduledItem";

export default function TimetableGrid({ placeBlocks, selectedDay, timetables, showTimetable }) {
  const timetable = timetables[selectedDay];
  const schedule = [...(placeBlocks[getTimeTableId(timetables, selectedDay)] || [])].sort((a, b) => a.start - b.start);
  const startHour = timetable ? Number(timetable.timeTableStartTime.split(":")[0]) : 0;
  const dateLabel = timetable?.date
    ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(new Date(timetable.date))
    : "";

  return (
    <section className={`${showTimetable ? "block" : "hidden lg:block"} rounded-2xl border border-[#ececf0] bg-white shadow-sm`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececf0] px-5 py-5 sm:px-6">
        <div>
          <h2 className="text-lg font-black text-[#111318]">상세 일정</h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-[#8b909a]"><CalendarDays className="h-3.5 w-3.5" />{dateLabel}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f6ff] px-3 py-1.5 text-xs font-bold text-[#1344FF]"><MapPin className="h-3.5 w-3.5" />{schedule.length}개 장소</span>
      </header>

      <div className="p-4 sm:p-6">
        {schedule.length ? (
          <ol>{schedule.map((item, index) => <ScheduledItem key={item.id} item={item} START_HOUR={startHour} index={index} isLast={index === schedule.length - 1} />)}</ol>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#e5e7eb] bg-[#fafafa] text-center">
            <MapPin className="mb-3 h-8 w-8 text-[#c8ccd3]" />
            <p className="font-bold text-[#666666]">이 날짜에는 일정이 없어요</p>
          </div>
        )}
      </div>
    </section>
  );
}
