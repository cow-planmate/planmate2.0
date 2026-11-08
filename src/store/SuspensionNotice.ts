import { create } from 'zustand';

export const useSuspensionNotice = create<{ isOpen: boolean; open: () => void; close: () => void }>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

export function showWriteError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && 'code' in error && error.code === 'USER_003') {
    useSuspensionNotice.getState().open();
  } else {
    alert(fallbackMessage);
  }
}
