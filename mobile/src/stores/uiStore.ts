import { create } from 'zustand';
import type { UIStore } from '../types/store';

export const useUIStore = create<UIStore>((set) => ({
  // State
  focusedTaskId: null,
  isIdeasSheetOpen: false,

  // Actions
  setFocusedTask: (id: string | null) => {
    set({ focusedTaskId: id });
  },

  toggleIdeasSheet: () => {
    set((state) => ({ isIdeasSheetOpen: !state.isIdeasSheetOpen }));
  },

  setIdeasSheetOpen: (isOpen: boolean) => {
    set({ isIdeasSheetOpen: isOpen });
  },
}));
