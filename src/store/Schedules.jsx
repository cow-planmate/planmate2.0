import { create } from "zustand";
import { checkOverlap, getTimeTableId } from "../utils/createUtils";

const useItemsStore = create((set, get) => ({
  items: {},

  getNextId: (timeTableId, start) => {
    return `temp-${timeTableId}-${start}`;
  },

  /** 사이드바 → 드래그 추가 */
  addItemFromDrag: ({ timetables, selectedDay, active, newStart, duration, blockId }) =>
    set((state) => {
      const ttId = getTimeTableId(timetables, selectedDay);

      return {
        items: {
          ...state.items,
          [ttId]: [
            ...(state.items[ttId] || []),
            {
              id: blockId, // blockId를 내부 id로 사용
              place: active.data.current.place,
              start: newStart,
              duration,
              memo: "",
            },
          ],
        },
      };
    }),

  /** 기존 일정 이동 */
  moveItem: ({ timetables, selectedDay, activeId, newStart }) =>
    set((state) => {
      const ttId = getTimeTableId(timetables, selectedDay);

      return {
        items: {
          ...state.items,
          [ttId]: (state.items[ttId] || []).map((item) =>
            item.id === activeId
              ? { ...item, start: newStart }
              : item
          ),
        },
      };
    }),

  /** 리사이즈 */
  resizeItem: ({
    timetables,
    selectedDay,
    id,
    newStart,
    newDuration,
    TOTAL_SLOTS,
  }) =>
    set((state) => {
      const ttId = getTimeTableId(timetables, selectedDay);
      const dayItems = state.items[ttId] || [];

      const target = dayItems.find((i) => i.id === id);
      if (!target) return state;

      let safeStart = newStart;
      let safeDuration = newDuration;

      if (safeDuration < 1) safeDuration = 1;
      if (safeStart < 0) {
        safeDuration += safeStart;
        safeStart = 0;
      }
      if (safeStart + safeDuration > TOTAL_SLOTS) {
        safeDuration = TOTAL_SLOTS - safeStart;
      }

      if (checkOverlap(safeStart, safeDuration, dayItems, id)) {
        return state;
      }

      return {
        items: {
          ...state.items,
          [ttId]: dayItems.map((i) =>
            i.id === id
              ? { ...i, start: safeStart, duration: safeDuration }
              : i
          ),
        },
      };
    }),

  /** 모바일 추가 */
  addItemMobile: ({ timetables, selectedDay, place, emptySlot, blockId }) =>
    set((state) => {
      const ttId = getTimeTableId(timetables, selectedDay);

      return {
        items: {
          ...state.items,
          [ttId]: [
            ...(state.items[ttId] || []),
            {
              id: blockId,
              place,
              start: emptySlot,
              duration: 4,
            },
          ],
        },
      };
    }),

  addItemFromWebsocket: ({ timeTableId, place, start, duration, blockId, memo }) =>
    set((state) => {
      const dayItems = state.items[timeTableId] || [];
      
      // 1. 정확히 같은 blockId가 있는지 확인 (업데이트 상황)
      const exactMatchIndex = dayItems.findIndex(item => item.id === blockId);
      
      if (exactMatchIndex !== -1) {
        return {
          items: {
            ...state.items,
            [timeTableId]: dayItems.map((item, idx) => 
              idx === exactMatchIndex 
                ? { ...item, place, start, duration, memo }
                : item
            )
          }
        };
      }

      // 2. 만약 blockId가 숫자(서버 ID)인데, 같은 위치/시간에 'temp-' ID(임시 ID)를 가진 아이템이 있는지 확인
      // 이 경우는 내가 만든 아이템이 서버에서 ID를 할당받아 돌아온 경우임
      if (typeof blockId === 'number') {
        const tempMatchIndex = dayItems.findIndex(item => 
          typeof item.id === 'string' && item.id.startsWith('temp-') && 
          item.start === start && 
          item.place.name === place.name
        );

        if (tempMatchIndex !== -1) {
          return {
            items: {
              ...state.items,
              [timeTableId]: dayItems.map((item, idx) => 
                idx === tempMatchIndex 
                  ? { ...item, id: blockId, place, start, duration, memo }
                  : item
              )
            }
          };
        }
      }

      // 3. 둘 다 아니면 새로 추가
      return {
        items: {
          ...state.items,
          [timeTableId]: [
            ...dayItems,
            {
              id: blockId,
              place,
              start,
              duration,
              memo,
            },
          ],
        },
      };
    }),

  moveItemFromWebsocket: ({ timeTableId, place, start, duration, blockId, memo }) =>
    set((state) => {
      const dayItems = state.items[timeTableId] || [];
      return {
        items: {
          ...state.items,
          [timeTableId]: dayItems.map((item) =>
            item.id === blockId
              ? { ...item, place: place, start: start, duration: duration, memo: memo }
              : item
          ),
        },
      };
    }),

  deleteItem: (deleteItemId, timeTableId) =>
    set((state) => {
      const dayItems = state.items[timeTableId];
      if (!dayItems) return state;

      return {
        items: {
          ...state.items,
          [timeTableId]: dayItems.filter(
            (item) => item.id !== deleteItemId
          ),
        },
      }
    }),

  updateItemMemo: (timeTableId, blockId, memo) =>
    set((state) => ({
      items: {
        ...state.items,
        [timeTableId]: (state.items[timeTableId] || []).map((item) =>
          item.id === blockId ? { ...item, memo } : item
        ),
      },
    })),

  resetItems: () =>
    set({
      items: {},
    }),
}));

export default useItemsStore;
