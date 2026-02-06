import { create } from 'zustand';
import type { UserProfile } from '../types/user';
import type { UserStore } from '../types/store';

export const useUserStore = create<UserStore>((set, get) => ({
  // State
  profile: null,
  isAuthenticated: false,

  // Actions
  setProfile: (profile: UserProfile | null) => {
    set({ profile, isAuthenticated: profile !== null });
  },

  updateSettings: (settings: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          ...settings,
          updated_at: new Date().toISOString(),
        },
      });
    }
  },

  incrementStreak: () => {
    const currentProfile = get().profile;
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          streak_count: currentProfile.streak_count + 1,
          streak_last_date: new Date().toISOString().split('T')[0],
        },
      });
    }
  },

  logout: () => {
    set({ profile: null, isAuthenticated: false });
  },
}));
