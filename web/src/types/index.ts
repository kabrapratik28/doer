export type TaskStatus = 'idea' | 'active' | 'done';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  priority: number | null;
  is_from_yesterday: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateTaskInput {
  text: string;
  status?: TaskStatus;
  priority?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  streak_count: number;
  streak_last_date: string;
  reset_time: string;
  haptics_enabled: boolean;
  timezone: string;
}

export const TASK_CONSTRAINTS = {
  MAX_ACTIVE_TASKS: 3,
  MAX_TEXT_LENGTH: 500,
  MIN_TEXT_LENGTH: 1,
} as const;
