import type { Task } from './task';

/**
 * Supabase realtime payload for tasks
 */
export interface RealtimeTaskPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: Task | null;
  old: { id: string } | null;
}

/**
 * Realtime subscription channels
 */
export const REALTIME_CHANNELS = {
  USER_TASKS: (userId: string) => `tasks:user_id=eq.${userId}`,
  USER_PROFILE: (userId: string) => `profiles:id=eq.${userId}`,
} as const;
