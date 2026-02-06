import { create } from 'zustand';
import type { Task } from '../types/task';
import type { TaskStore } from '../types/store';

export const useTaskStore = create<TaskStore>((set, get) => ({
  // State
  tasks: [],
  activeTasks: [],
  ideaTasks: [],
  isLoading: false,

  // Actions
  setTasks: (tasks: Task[]) => {
    const activeTasks = tasks
      .filter((t) => t.status === 'active')
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
    const ideaTasks = tasks.filter((t) => t.status === 'idea');

    set({ tasks, activeTasks, ideaTasks });
  },

  addTask: (task: Task) => {
    const tasks = [...get().tasks, task];
    get().setTasks(tasks);
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    );
    get().setTasks(tasks);
  },

  removeTask: (id: string) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    get().setTasks(tasks);
  },

  reorderTasks: (taskIds: string[]) => {
    const tasks = get().tasks.map((task) => {
      const newPriority = taskIds.indexOf(task.id);
      if (newPriority !== -1) {
        return { ...task, priority: newPriority + 1 };
      }
      return task;
    });
    get().setTasks(tasks);
  },
}));
