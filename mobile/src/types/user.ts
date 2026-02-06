/**
 * User profile with streak data
 */
export interface UserProfile {
  id: string;
  email: string;
  streak_count: number;
  streak_last_date: string;
  reset_time: string;
  haptics_enabled: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

/**
 * User settings update payload
 */
export interface UpdateUserSettingsInput {
  reset_time?: string;
  haptics_enabled?: boolean;
  timezone?: string;
}

/**
 * Weekly stats for velocity score
 */
export interface WeeklyStats {
  week_start: string;
  tasks_completed: number;
  tasks_created: number;
  velocity_score: number;
}
