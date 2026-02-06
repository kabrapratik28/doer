import { create } from 'zustand';
import type { Task, CreateTaskInput } from '@/types';
import { TASK_CONSTRAINTS } from '@/types';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;

  // Derived getters
  getActiveTasks: () => Task[];
  getIdeaTasks: () => Task[];

  // Actions
  addTask: (input: CreateTaskInput) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  promoteTask: (id: string) => void;
  reorderTasks: (taskIds: string[]) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,

  getActiveTasks: () => {
    return get().tasks
      .filter(t => t.status === 'active')
      .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  },

  getIdeaTasks: () => {
    return get().tasks.filter(t => t.status === 'idea');
  },

  addTask: (input: CreateTaskInput) => {
    const activeTasks = get().getActiveTasks();
    const hasRoom = activeTasks.length < TASK_CONSTRAINTS.MAX_ACTIVE_TASKS;

    const newTask: Task = {
      id: generateId(),
      text: input.text,
      status: hasRoom ? 'active' : 'idea',
      priority: hasRoom ? activeTasks.length + 1 : null,
      is_from_yesterday: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };

    set(state => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  completeTask: (id: string) => {
    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id
          ? { ...t, status: 'done' as const, completed_at: new Date().toISOString() }
          : t
      ),
    }));
  },

  deleteTask: (id: string) => {
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
    }));
  },

  promoteTask: (id: string) => {
    const activeTasks = get().getActiveTasks();
    if (activeTasks.length >= TASK_CONSTRAINTS.MAX_ACTIVE_TASKS) return;

    set(state => ({
      tasks: state.tasks.map(t =>
        t.id === id
          ? { ...t, status: 'active' as const, priority: activeTasks.length + 1 }
          : t
      ),
    }));
  },

  reorderTasks: (taskIds: string[]) => {
    set(state => ({
      tasks: state.tasks.map(t => {
        const newPriority = taskIds.indexOf(t.id);
        if (newPriority === -1) return t;
        return { ...t, priority: newPriority + 1 };
      }),
    }));
  },
}));
