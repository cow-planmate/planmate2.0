import { useScheduleItemLogic } from "../../hooks/useScheduleItemLogic";

const ScheduleItem = ({
  item,
  timeSlots,
  schedule,
  selectedDay,
  places,
  onScheduleUpdate,
  onPlacesUpdate,
  onDragStart
}) => {
  const tripCategory = { 0: "관광지", 1: "숙소", 2: "식당", 4: "검색" };
  const tripColor1 = { 0: "bg-lime-50", 1: "bg-orange-50", 2: "bg-blue-50", 4: "bg-gray-50" };
  const tripColor2 = { 0: "border-lime-100", 1: "border-orange-100", 2: "border-blue-100", 4: "border-gray-100" };
  const tripColor3 = { 0: "bg-lime-700", 1: "bg-orange-700", 2: "bg-blue-700", 4: "bg-gray-700" };
  const tripColor4 = { 0: "bg-lime-200", 1: "bg-orange-200", 2: "bg-blue-200", 4: "bg-gray-200" };

  const {
    getTimeSlotIndex,
    handleDeleteItem,
    handleResizeStart
  } = useScheduleItemLogic({
    timeSlots,
    schedule,
    selectedDay,
    places,
    onScheduleUpdate,
    onPlacesUpdate
  });

  const startIndex = getTimeSlotIndex(item.timeSlot);
  const height = item.duration * 30; // 15분당 30px

  return (
    <div
      className={`absolute left-16 p-2 text-sm shadow-xl border ${tripColor1[item.categoryId]} ${tripColor2[item.categoryId]} rounded-lg z-10 group cursor-move`}
      style={{
        top: `${startIndex * 30}px`,
        height: `${height}px`,
        width: "329px",
      }}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        onDragStart(e, item);
      }}
    >
      {/* 위쪽 리사이즈 핸들 */}
      <div
        className={`absolute top-0 left-0 right-0 h-3 cursor-ns-resize ${tripColor4[item.categoryId]} opacity-0 group-hover:opacity-70 transition-opacity rounded-t-md flex items-center justify-center`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e, item, "top");
        }}
        draggable={false}
      >
        <div className={`w-8 h-0.5 ${tripColor3[item.categoryId]} rounded`}></div>
      </div>

      {/* 컨텐츠 */}
      <div
        className="p-3 h-full flex items-center justify-between"
        style={{ paddingTop: "12px", paddingBottom: "12px" }}
      >
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="font-bold text-lg truncate">{item.name}</div>
          <div className="text-gray-500 truncate text-sm">
            {tripCategory[item.categoryId]}
          </div>
        </div>
        <button
          className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold leading-none flex-shrink-0 w-6 h-6 flex items-center justify-center pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleDeleteItem(item);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ×
        </button>
      </div>

      {/* 아래쪽 리사이즈 핸들 */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-3 cursor-ns-resize ${tripColor4[item.categoryId]} opacity-0 group-hover:opacity-70 transition-opacity rounded-b-md flex items-center justify-center`}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleResizeStart(e, item, "bottom");
        }}
        draggable={false}
      >
        <div className={`w-8 h-0.5 ${tripColor3[item.categoryId]} rounded`}></div>
      </div>
    </div>
  );
};

export default ScheduleItem;