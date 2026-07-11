import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

const usePlanStore = create((set) => ({
  planName: "",
  travelCategoryName: "",
  travelName: "",
  travelId: 0,
  departure: "",
  transportationCategoryId: 0,
  adultCount: 0,
  childCount: 0,
  planId: 0,
  eventId: "", // 고유한 값으로 변경하면 안 됨.

  setPlanField: (field, value) =>
    set((state) => ({
      ...state,
      [field]: value,
    })),

  setPlanAll: (payload) =>
    set((state) => ({
      ...state,
      ...payload,
    })),

  setEventId: () =>
    set((state) => ({
      ...state,
      eventId: uuidv4(),
    })),

  resetPlan: () =>
    set({
      planName: "",
      travelCategoryName: "",
      travelName: "",
      travelId: 0,
      departure: "",
      transportationCategoryId: 0,
      adultCount: 0,
      childCount: 0,
      planId: 0,
      eventId: "",
    }),
}));

export default usePlanStore;