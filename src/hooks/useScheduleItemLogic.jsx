import { 
  checkTimeOverlap, 
  getTimeSlotIndex, 
  getCategoryByIconUrl 
} from "../utils/scheduleUtils";

export const useScheduleItemLogic = ({
  timeSlots,
  schedule,
  selectedDay,
  places,
  onScheduleUpdate,
  onPlacesUpdate
}) => {
  // 삭제 함수
  const handleDeleteItem = (item) => {
    const newSchedule = { ...schedule };
    newSchedule[selectedDay] = newSchedule[selectedDay].filter(
      (scheduleItem) => scheduleItem.placeId !== item.placeId
    );
    onScheduleUpdate(newSchedule);

    // 추천 탭에 다시 추가
    const newPlaces = { ...places };
    const originalItem = { ...item };
    delete originalItem.timeSlot;
    delete originalItem.duration;

    // 원래 카테고리가 있으면 그것을 사용, 없으면 categoryId로 판단
    let category = originalItem.originalCategory;

    if (!category) {
      category = getCategoryByIconUrl(originalItem.categoryId);
    }

    delete originalItem.originalCategory;
    newPlaces[category].push(originalItem);

    onPlacesUpdate(newPlaces);
  };

  // 리사이즈 시작 함수
  const handleResizeStart = (e, item, direction) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    const originalItem = { ...item };
    const originalTimeIndex = getTimeSlotIndex(originalItem.timeSlot, timeSlots);

    const handleMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const deltaSlots = Math.round(deltaY / 30);

      const newSchedule = { ...schedule };
      const itemIndex = newSchedule[selectedDay].findIndex(
        (scheduleItem) => scheduleItem.placeId === item.placeId
      );

      if (itemIndex !== -1) {
        let testItem = { ...originalItem };
        const daySchedule = newSchedule[selectedDay];

        if (direction === "top") {
          // 위쪽 리사이징: 시작 시간 변경, 길이 조절
          const newStartIndex = Math.max(
            0,
            Math.min(
              originalTimeIndex + deltaSlots,
              originalTimeIndex + originalItem.duration - 1
            )
          );
          const newDuration =
            originalItem.duration - (newStartIndex - originalTimeIndex);

          if (newDuration >= 1 && newStartIndex < timeSlots.length) {
            testItem = {
              ...originalItem,
              timeSlot: timeSlots[newStartIndex],
              duration: newDuration,
            };
          }
        } else {
          // 아래쪽 리사이징: 길이만 변경
          const newDuration = Math.max(1, originalItem.duration + deltaSlots);
          const endIndex = originalTimeIndex + newDuration - 1;

          if (endIndex < timeSlots.length) {
            testItem = {
              ...originalItem,
              duration: newDuration,
            };
          }
        }

        // 겹침 체크 (자기 자신은 제외)
        if (!checkTimeOverlap(testItem, timeSlots, daySchedule, item.placeId)) {
          newSchedule[selectedDay][itemIndex] = testItem;
          onScheduleUpdate(newSchedule);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return {
    getTimeSlotIndex: (timeSlot) => getTimeSlotIndex(timeSlot, timeSlots),
    handleDeleteItem,
    handleResizeStart
  };
};