import { create } from "zustand";

const useServerStatusStore = create((set) => ({
  isServerDown: false,
  setServerDown: () => set({ isServerDown: true }),
  clearServerDown: () => set({ isServerDown: false }),
}));

export default useServerStatusStore;