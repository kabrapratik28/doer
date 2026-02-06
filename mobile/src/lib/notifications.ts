import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CLARITY_PROMPT_DELAY_MS } from '../types/constants';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Request permission for push notifications
 */
export async function registerForPushNotifications(): Promise<string | null> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

/**
 * Schedule the "Clarity Prompt" notification 15 minutes after adding an idea
 */
export async function scheduleClarityPrompt(taskText: string): Promise<string> {
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DOER',
      body: `Is "${taskText}" a Now or Idea?`,
      data: { type: 'clarity_prompt' },
    },
    trigger: {
      seconds: CLARITY_PROMPT_DELAY_MS / 1000,
    },
  });
  return identifier;
}

/**
 * Schedule daily reset notification
 */
export async function scheduleDailyReset(resetTime: string): Promise<string> {
  const [hours, minutes] = resetTime.split(':').map(Number);

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'DOER',
      body: "New day, clean slate. What's The Big One for today?",
      data: { type: 'daily_reset' },
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all pending notifications
 */
export async function getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
