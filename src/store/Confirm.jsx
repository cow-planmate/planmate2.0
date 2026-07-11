import { create } from "zustand";

const useConfirmStore = create((set) => ({
  isOpen: false,
  message: "",
  resolvePromise: null,

  showConfirm: (message) => {
    return new Promise((resolve) => {
      set({
        isOpen: true,
        message,
        resolvePromise: resolve,
      });
    });
  },

  confirm: () => {
    set((state) => {
      if (state.resolvePromise) state.resolvePromise(true);
      return { isOpen: false, resolvePromise: null };
    });
  },

  cancel: () => {
    set((state) => {
      if (state.resolvePromise) state.resolvePromise(false);
      return { isOpen: false, resolvePromise: null };
    });
  },
}));

export default useConfirmStore;
