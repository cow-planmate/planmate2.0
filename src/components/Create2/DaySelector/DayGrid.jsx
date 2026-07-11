const DayGrid = ({setTimetables, timetable, index, updateDate, timetablesLength = 0, setUpdate}) => {
  const rowClass = "space-x-3 py-2 grid grid-cols-[40px_150px_120px_120px] gap-4 items-center border-b min-w-max";
  const times = [];
  for (let h = 0; h < 25; h++) {
    for (let m = 0; m < 60; m += 60) {
      const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(
        2,
        "0"
      )}:00`;
      times.push(formatted);
    }
  }

  const upUpdate = (baseTime, startAndEnd) => {
    setUpdate((prev) => {
      const idx = prev.findIndex(item => item.timeTableId === timetable.timeTableId);

      if (idx !== -1) {
        if (startAndEnd == "start") {
          return prev.map(item =>
            item.timeTableId === timetable.timeTableId
              ? { ...item, timeTableStartTime: baseTime }
              : item
          );
        } else {
          return prev.map(item =>
            item.timeTableId === timetable.timeTableId
              ? { ...item, timeTableEndTime: baseTime }
              : item
          );
        }
      }

      if (startAndEnd == "start") {
        return [
          ...prev,
          {
            timeTableId: timetable.timeTableId,
            date: timetable.date,   
            timeTableEndTime: timetable.timeTableEndTime,
            timeTableStartTime: baseTime
          }
        ];
      } else {
        return [
          ...prev,
          {
            timeTableId: timetable.timeTableId,
            date: timetable.date,   
            timeTableEndTime: baseTime,
            timeTableStartTime: timetable.timeTableStartTime
          }
        ];
      }
    })
  }

  const timeTableStartTime = (e) => {
    const baseTime = e.target.value;
    let baseIndex = index;
    if (timetablesLength > 0) {baseIndex -= timetablesLength;}
    if (timetablesLength == 0) upUpdate(baseTime, "start");
    
    setTimetables((prev) =>
      prev.map((item, i) =>
        i === baseIndex ? { ...item, timeTableStartTime: baseTime } : item
      )
    );
  }

  const timeTableEndTime = (e) => {
    const baseTime = e.target.value;
    let baseIndex = index;
    if (timetablesLength > 0) {baseIndex -= timetablesLength;}
    if (timetablesLength == 0) upUpdate(baseTime, "end");

    setTimetables((prev) =>
      prev.map((item, i) =>
        i === baseIndex ? { ...item, timeTableEndTime: baseTime } : item
      )
    );
  }

  return (
    <div className={rowClass}>
      <div>{index+1}일차</div>
      {index === 0 ? 
        <input
          type="date"
          value={timetable.date}
          className="border rounded-lg px-2 h-11"
          onChange={updateDate}
        />
      :
        <div>{timetable.date}</div>
      }
      <select
        value={timetable.timeTableStartTime}
        onChange={timeTableStartTime}
        className="border rounded-lg px-2 h-11"
      >
        {times.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={timetable.timeTableEndTime}
        onChange={timeTableEndTime}
        className="border rounded-lg px-2 h-11"
      >
        {times.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  )
}

export default DayGrid;