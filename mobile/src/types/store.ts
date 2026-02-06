import type { Task } from './task';
import type { UserProfile } from './user';

/**
 * Task store state and actions
 */
export interface TaskStore {
  // State
  tasks: Task[];
  activeTasks: Task[];
  ideaTasks: Task[];
  isLoading: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  reorderTasks: (taskIds: string[]) => void;
}

/**
 * User store state and actions
 */
export interface UserStore {
  // State
  profile: UserProfile | null;
  isAuthenticated: boolean;

  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateSettings: (settings: Partial<UserProfile>) => void;
  incrementStreak: () => void;
  logout: () => void;
}

/**
 * UI store for ephemeral state
 */
export interface UIStore {
  // State
  focusedTaskId: string | null;
  isIdeasSheetOpen: boolean;

  // Actions
  setFocusedTask: (id: string | null) => void;
  toggleIdeasSheet: () => void;
  setIdeasSheetOpen: (isOpen: boolean) => void;
}
