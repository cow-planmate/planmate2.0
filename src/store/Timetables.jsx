import { create } from "zustand";
import usePlanStore from "./Plan";
import useNicknameStore from "./Nickname";
import { getTimeSlotIndex, getTimeTableId } from "../utils/createUtils";
import useItemsStore from "./Schedules";

const sortByDate = (list) =>
  [...list].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

const useTimetableStore = create((set, get) => ({
  timetables: [],
  selectedDay: 0,

  START_HOUR: 0,
  END_HOUR: 0,
  SLOT_HEIGHT: 40,
  TOTAL_SLOTS: 0,

  // CREATE
  setTimetableCreate: (newTimetable) =>
    set((state) => {
      const sameDateItem = state.timetables.find(
        (item) => item.date === newTimetable.date
      );

      // 1. 같은 date 없음 → push
      if (!sameDateItem) {
        return {
          timetables: [...state.timetables, newTimetable],
        };
      }

      // 2. 같은 date 있고 timeTableId는 다름 → 기존 삭제 후 새로 넣기
      const filtered = state.timetables.filter(
        (item) => item.date !== newTimetable.date
      );

      return {
        ...state,
        timetables: sortByDate([...filtered, newTimetable]),
      };
    }),

  // UPDATE
  setTimetableUpdate: (updatedTimetable) =>
    set((state) => {
      const filtered = state.timetables.filter(
        (item) => item.timeTableId !== updatedTimetable.timeTableId
      );

      const prev = state.timetables.find(
        p => p.timeTableId === updatedTimetable.timeTableId
      );

      if (prev && prev.timeTableStartTime !== updatedTimetable.timeTableStartTime) {
        const plusTime = getTimeSlotIndex(updatedTimetable.timeTableStartTime, prev.timeTableStartTime);

        useItemsStore.getState().items[updatedTimetable.timeTableId]?.forEach((item) => {
          const timeTableId = updatedTimetable.timeTableId;
          const blockId = item.id;
          const place = item.place;
          const start = item.start + plusTime;
          const duration = item.duration;
          useItemsStore.getState().moveItemFromWebsocket({ timeTableId, place, start, duration, blockId });
        })
      }

      if (getTimeTableId(state.timetables, state.selectedDay) == updatedTimetable.timeTableId) {
        const startHour = Number(updatedTimetable.timeTableStartTime.split(":")[0]);
        const endHour = Number(updatedTimetable.timeTableEndTime.split(":")[0]);

        return {
          ...state,
          START_HOUR: startHour,
          END_HOUR: endHour,
          TOTAL_SLOTS: ((endHour - startHour) * 60) / 15,
          timetables: sortByDate([...filtered, updatedTimetable]),
        };
      }

      return {
        ...state,
        timetables: sortByDate([...filtered, updatedTimetable]),
      };
    }),

  // DELETE
  setTimetableDelete: (timeTableId) => {
    // 1. 먼저 삭제하려는 timetable을 배열에서 제거합니다.
    set((state) => ({
      timetables: sortByDate(
        state.timetables.filter((item) => item.timeTableId !== timeTableId)
      ),
    }));

    const { selectedDay, timetables, setSelectedDay } = get();

    // 2. 남은 timetable이 있는지 확인하고 처리합니다.
    if (timetables.length > 0) {
      // 선택된 인덱스가 남은 배열의 길이를 벗어난 경우 (즉, 마지막 탭이 삭제된 경우)
      if (selectedDay >= timetables.length) {
        setSelectedDay(timetables.length - 1);
      } else {
        // 남아있더라도 삭제로 인해 현재 인덱스의 데이터가 바뀌었을 수 있으므로 갱신
        setSelectedDay(selectedDay);
      }
    } else {
      // 모든 timetable이 삭제된 경우 상태를 초기화
      set({ selectedDay: 0, START_HOUR: 0, END_HOUR: 0, TOTAL_SLOTS: 0 });
    }
  },

  setTimetableAll: (payload) =>
    set((state) => ({
      ...state,
      timetables: payload
    })),

  setSelectedDay: (dayIndex) => {
    const { timetables } = get();
    const timetable = timetables[dayIndex];

    if (!timetable) return;

    const startHour = Number(timetable.timeTableStartTime.split(":")[0]);
    const endHour = Number(timetable.timeTableEndTime.split(":")[0]);

    set({
      selectedDay: dayIndex,
      START_HOUR: startHour,
      END_HOUR: endHour,
      TOTAL_SLOTS: ((endHour - startHour) * 60) / 15,
    });

    useNicknameStore.getState().setLastSelectedDay(
      usePlanStore.getState().planId,
      dayIndex,
    );
  },

  resetTimetable: () =>
    set({
      timetables: [],
      selectedDay: 0,
      START_HOUR: 0,
      END_HOUR: 0,
      TOTAL_SLOTS: 0,
    }),
}));

export default useTimetableStore;