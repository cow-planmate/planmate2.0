import usePlanStore from "../store/Plan";
import useTimetableStore from "../store/Timetables";
import usePlacesStore from "../store/Places";

// blockCategory(백엔드 enum 문자열) <-> categoryId(프론트 내부 정수 표현) 매핑.
// 정수 순서는 scheduleUtils.jsx의 getCategoryByIconUrl과 동일하게 맞춤(0=관광지,1=숙소,2=식당,3=직접추가,4=검색).
export const BLOCK_CATEGORY_TO_ID = {
  ATTRACTION: 0,
  ACCOMMODATION: 1,
  RESTAURANT: 2,
  FREE: 3,
  SEARCH: 4,
};

export const ID_TO_BLOCK_CATEGORY = {
  0: "ATTRACTION",
  1: "ACCOMMODATION",
  2: "RESTAURANT",
  4: "SEARCH",
};

const PLACE_CATEGORY_TO_ID = {
  ATTRACTION: 0,
  ACCOMMODATION: 1,
  RESTAURANT: 2,
};

// GET /api/place(PlaceSummaryDto) 응답을 프론트 내부 place 객체 형태로 변환.
// rating/url은 백엔드에 대응 필드가 없어(TourAPI 전환) 채우지 않음 — UI가 이미 optional로 처리함.
export function mapPlaceSummary(dto) {
  return {
    placeId: dto.contentId,
    name: dto.title,
    formatted_address: dto.addr1,
    photoUrl: dto.thumbnailUrl,
    iconUrl: "./src/assets/imgs/default.png",
    categoryId: PLACE_CATEGORY_TO_ID[dto.category] ?? null,
    xLocation: dto.longitude,
    yLocation: dto.latitude,
    contentTypeId: dto.contentTypeId,
    copyrightDivCd: dto.copyrightDivCd,
  };
}

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
    photoUrl: place.photoUrl,
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
    categoryId: BLOCK_CATEGORY_TO_ID[block.blockCategory] ?? null,
    name: block.placeName,
    formatted_address: block.placeAddress,
    photoUrl: block.placeThumbnailUrl,
    iconUrl: "./src/assets/imgs/default.png",
    xLocation: block.longitude,
    yLocation: block.latitude,
    contentTypeId: block.placeContentTypeId,
    copyrightDivCd: block.placeCopyrightDivCd,
  }

  return { timeTableId, place, start, duration, blockId, memo };
}

export const resetAllStores = () => {
  usePlanStore.getState().resetPlan();
  useTimetableStore.getState().resetTimetable();
  usePlacesStore.getState().resetPlaces();
};