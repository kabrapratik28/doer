import * as Haptics from 'expo-haptics';
import { useUserStore } from '../stores/userStore';

/**
 * Haptics utility with user preference checking
 */
export const haptics = {
  light: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  medium: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  heavy: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  success: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  warning: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  error: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  selection: () => {
    const enabled = useUserStore.getState().profile?.haptics_enabled ?? true;
    if (enabled) {
      Haptics.selectionAsync();
    }
  },
};
