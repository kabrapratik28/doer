import { create } from 'zustand';

interface UIStore {
  focusedTaskId: string | null;
  isIdeasSheetOpen: boolean;
  streakCount: number;

  setFocusedTask: (id: string | null) => void;
  toggleIdeasSheet: () => void;
  incrementStreak: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  focusedTaskId: null,
  isIdeasSheetOpen: false,
  streakCount: 0,

  setFocusedTask: (id) => set({ focusedTaskId: id }),
  toggleIdeasSheet: () => set(state => ({ isIdeasSheetOpen: !state.isIdeasSheetOpen })),
  incrementStreak: () => set(state => ({ streakCount: state.streakCount + 1 })),
}));
