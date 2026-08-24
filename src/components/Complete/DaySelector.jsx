export default function DaySelector({ timetables, selectedDay, setSelectedDay }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}.${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <nav className="no-scrollbar mb-4 flex gap-2 overflow-x-auto" aria-label="여행 날짜 선택">
      {timetables.map((timetable, index) => {
        const active = selectedDay === index;
        return (
          <button key={timetable.timeTableId} type="button" onClick={() => setSelectedDay(index)} aria-current={active ? "date" : undefined} className={`flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition ${active ? "border-[#1344FF] bg-[#1344FF] text-white shadow-sm" : "border-[#e5e7eb] bg-white text-[#666666] hover:bg-gray-50"}`}>
            <span>Day {index + 1}</span>
            <span className={active ? "text-white/70" : "text-[#9aa0ab]"}>{formatDate(timetable.date)}</span>
          </button>
        );
      })}
    </nav>
  );
}
