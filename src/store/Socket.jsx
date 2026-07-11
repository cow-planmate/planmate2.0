import { create } from "zustand";

const useSocketStore = create((set) => ({
  isConnected: false,
  setConnected: () => set({ isConnected: true }),
  setDisconnected: () => set({ isConnected: false }),
}));

export default useSocketStore;
