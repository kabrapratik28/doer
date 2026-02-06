// Shared types for DOER Edge Functions

export type TaskStatus = 'idea' | 'active' | 'done';

export interface Task {
  id: string;
  user_id: string;
  text: string;
  status: TaskStatus;
  priority: number | null;
  is_from_yesterday: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  streak_count: number;
  streak_last_date: string | null;
  reset_time: string;
  haptics_enabled: boolean;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface WeeklyStats {
  week_start: string;
  tasks_completed: number;
  tasks_created: number;
  velocity_score: number;
}

// Request types
export interface CompleteTaskRequest {
  id: string;
}

export interface PromoteTaskRequest {
  id: string;
  priority?: number;
}

export interface ReorderTasksRequest {
  task_ids: string[];
}

// Constants
export const MAX_ACTIVE_TASKS = 3;
export const MAX_TEXT_LENGTH = 500;
export const MIN_TEXT_LENGTH = 1;
