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
  3: "FREE", // 직접 추가한 장소
  4: "SEARCH",
};

const PLACE_CATEGORY_TO_ID = {
  ATTRACTION: 0,
  ACCOMMODATION: 1,
  RESTAURANT: 2,
};

export function getBlockCategoryId(block) {
  const rawCategory =
    block?.blockCategory ??
    block?.placeCategoryId ??
    block?.placeCategory ??
    block?.categoryId;

  if (typeof rawCategory === "number") {
    return rawCategory >= 0 && rawCategory <= 4 ? rawCategory : null;
  }

  if (typeof rawCategory === "string") {
    const normalizedCategory = rawCategory.trim().toUpperCase();
    if (normalizedCategory in BLOCK_CATEGORY_TO_ID) {
      return BLOCK_CATEGORY_TO_ID[normalizedCategory];
    }

    const numericCategory = Number(normalizedCategory);
    if (
      Number.isInteger(numericCategory) &&
      numericCategory >= 0 &&
      numericCategory <= 4
    ) {
      return numericCategory;
    }
  }

  return null;
}

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

// GET /api/place/text-search(PlaceTextSearchResultDto) 응답을 일정 편집 화면의
// 공통 place 객체로 변환한다. 검색으로 추가한 블록은 SEARCH 카테고리로 저장된다.
export function mapTextSearchResult(dto) {
  const latitude = dto.latitude ?? null;
  const longitude = dto.longitude ?? null;
  const hasCoordinates = latitude != null && longitude != null;

  return {
    placeId: dto.placeId,
    name: dto.name,
    formatted_address: dto.address,
    photoUrl: dto.thumbnailUrl,
    iconUrl: "./src/assets/imgs/default.png",
    categoryId: BLOCK_CATEGORY_TO_ID.SEARCH,
    xLocation: longitude,
    yLocation: latitude,
    url: hasCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodeURIComponent(dto.placeId)}`
      : "",
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

  // 서버 DTO(TimeTablePlaceBlockDto / TimetablePlaceBlockDto)의 필드명을 그대로 사용한다.
  // DTO가 @JsonIgnoreProperties(ignoreUnknown = true)라 이름이 다르면 조용히 버려지므로 주의.
  const block = {
    blockId: finalBlockId,
    timeTableId: timeTableId,
    placeId: place.placeId ?? null,
    placeName: place.name,
    placeContentTypeId: place.contentTypeId ?? null,
    placeAddress: place.formatted_address ?? null,
    placeThumbnailUrl: place.photoUrl ?? null,
    placeCopyrightDivCd: place.copyrightDivCd ?? null,
    latitude: place.yLocation ?? place.ylocation ?? null,
    longitude: place.xLocation ?? place.xlocation ?? null,
    blockStartTime: startTime,
    blockEndTime: endTime,
    blockCategory: ID_TO_BLOCK_CATEGORY[getBlockCategoryId(place)] ?? "FREE",
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
    categoryId: getBlockCategoryId(block),
    name: block.placeName,
    formatted_address: block.placeAddress,
    photoUrl: block.placeThumbnailUrl,
    iconUrl: "./src/assets/imgs/default.png",
    xLocation: block.longitude ?? block.xLocation ?? block.xlocation,
    yLocation: block.latitude ?? block.yLocation ?? block.ylocation,
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
