import usePlanStore from "../store/Plan";
import useTimetableStore from "../store/Timetables";
import usePlacesStore from "../store/Places";

export const formatTime = (slotIndex) => {
  const { START_HOUR } = useTimetableStore.getState();

  const totalMin = slotIndex * 15 + START_HOUR * 60;
  const h = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const m = (totalMin % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

export const checkOverlap = (start, duration, items, excludeId = null) => {
  const end = start + duration;
  if (!items) {
    return false;
  }
  return items.some((i) => {
    if (excludeId && i.id === excludeId) return false;
    const iEnd = i.start + i.duration;
    console.log(start, end)
    console.log(i.start, iEnd)
    return start < iEnd && end > i.start;
  });
};

export const findEmptySlot = (duration, items) => {
  const { TOTAL_SLOTS } = useTimetableStore.getState();

  for (let i = 0; i <= TOTAL_SLOTS - duration; i++) {
    const isOverlapping = checkOverlap(i, duration, items);
    if (!isOverlapping) {
      return i;
    }
  }
  return -1;
};

export const getTimeTableId = (timetables, selectedDay) => {
  return timetables[selectedDay].timeTableId;
}

export function slotIndexToTime(START_HOUR, newStart, intervalMinutes = 15) {
  const totalMinutes =
    START_HOUR * 60 + newStart * intervalMinutes;

  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const m = (totalMinutes % 60)
    .toString()
    .padStart(2, '0');

  return `${h}:${m}:00`;
}

export function exportBlock(timeTableId, place, newStart, duration, blockId, noLogin = false, date = null, memo = "") {
  const { START_HOUR } = useTimetableStore.getState();
  const startTime = slotIndexToTime(START_HOUR, newStart);
  const endTime = slotIndexToTime(START_HOUR, newStart + duration);
  
  const BASE_URL = import.meta.env.VITE_API_URL;

  // photoUrl이 null일 경우 백엔드 이미지 프록시 URL로 대체
  const photoUrl = place.photoUrl || (place.placeId ? `${BASE_URL}/image/place/${encodeURIComponent(place.placeId)}` : null);

  // blockId가 'temp-'로 시작하는 문자열이면 백엔드 전송 시 null로 보냄 (새로 생성하는 항목)
  const finalBlockId = (typeof blockId === 'string' && blockId.startsWith('temp-')) ? null : blockId;

  const block = {
    blockId: finalBlockId,
    placeName: place.name,
    placeRating: place.rating,
    placeAddress: place.formatted_address,
    placeLink: place.url,
    blockStartTime: startTime,
    blockEndTime: endTime,
    startTime: startTime,
    endTime: endTime,
    xLocation: place.xLocation || place.xlocation,
    yLocation: place.yLocation || place.ylocation,
    placeCategoryId: place.categoryId,
    timeTableId: timeTableId,
    photoUrl: photoUrl,
    placeId: place.placeId,
    memo: memo
  };

  if (noLogin) {
    block.date = date;
  }

  return block;
}

export function getTimeSlotIndex(timeTableStartTime, time, intervalMinutes = 15) {
  if (!time) return 0;
  const toMinutes = (t) => {
    const [h, m, s] = t.split(':').map(Number);
    return h * 60 + m + (s || 0) / 60;
  };

  const startMinutes = toMinutes(timeTableStartTime);
  const targetMinutes = toMinutes(time);

  return Math.floor((targetMinutes - startMinutes) / intervalMinutes);
}

export function convertBlock(block) {
  const timeTableId = block.timeTableId;
  const { timetables } = useTimetableStore.getState();
  const timeTableStartTime = timetables.find(
    (t) => t.timeTableId === timeTableId
  )?.timeTableStartTime || "00:00:00";

  const startTime = block.startTime || block.blockStartTime;
  const endTime = block.endTime || block.blockEndTime;

  const start = getTimeSlotIndex(timeTableStartTime, startTime);
  const duration = getTimeSlotIndex(startTime, endTime);
  
  // blockId를 프론트엔드 아이템의 id로 사용
  const blockId = block.blockId;
  const memo = block.memo;

  const place = {
    placeId: block.placeId,
    categoryId: block.placeCategoryId,
    url: block.placeLink,
    name: block.placeName,
    formatted_address: block.placeAddress,
    rating: block.placeRating,
    photoUrl: block.photoUrl,
    iconUrl: "./src/assets/imgs/default.png",
    xLocation: block.xLocation || block.xlocation,
    yLocation: block.yLocation || block.ylocation,
  }

  return { timeTableId, place, start, duration, blockId, memo };
}

export const resetAllStores = () => {
  usePlanStore.getState().resetPlan();
  useTimetableStore.getState().resetTimetable();
  usePlacesStore.getState().resetPlaces();
};