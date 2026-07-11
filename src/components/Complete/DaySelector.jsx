export default function DaySelector({ timetables, selectedDay, setSelectedDay }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}.${day}.`;
  };

  return (
    <div
      className="
        flex md:flex-col
        px-5 md:px-0
        overflow-x-auto md:overflow-y-auto
        space-x-2 md:space-x-0 md:space-y-4
      "
    >
      {timetables.map((timetable, index) => (
        <button
          key={timetable.timeTableId}
          className={`px-3 h-9 md:h-auto md:px-4 md:py-4 rounded-lg flex md:flex-col space-x-1 md:space-x-0 items-center shrink-0 ${selectedDay === index
            ? "bg-main text-white"
            : "bg-white text-gray-700 border border-gray-300"
            }`}
          onClick={() => setSelectedDay(index)}
        >
          <div className="text-base md:text-xl font-semibold">
            {index + 1}일차
          </div>
          <div
            className={`text-xs md:text-sm ${selectedDay === index ? "text-white opacity-80" : "text-gray-500"
              }`}
          >
            {formatDate(timetable.date)}
          </div>
        </button>
      ))}
    </div>
  )
}