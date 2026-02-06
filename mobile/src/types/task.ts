/**
 * Task status lifecycle:
 * idea → active → done → (archived via daily reset)
 */
export type TaskStatus = 'idea' | 'active' | 'done';

/**
 * Core Task interface - the primary data entity
 */
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

/**
 * Task creation payload (client → server)
 */
export interface CreateTaskInput {
  text: string;
  status?: TaskStatus;
  priority?: number;
}

/**
 * Task update payload (client → server)
 */
export interface UpdateTaskInput {
  text?: string;
  status?: TaskStatus;
  priority?: number;
}

/**
 * Promote task from idea to active
 */
export interface PromoteTaskInput {
  id: string;
  priority?: number;
}

/**
 * Reorder tasks payload
 */
export interface ReorderTasksInput {
  task_ids: string[];
}
