import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useTaskStore } from '../stores/taskStore';
import { useUserStore } from '../stores/userStore';
import type { Task, CreateTaskInput, UpdateTaskInput, PromoteTaskInput } from '../types/task';
import { queryKeys, TASK_CONSTRAINTS } from '../types';
import { haptics, scheduleClarityPrompt } from '../lib';

/**
 * Fetch all tasks for the current user
 */
export function useTasks() {
  const setTasks = useTaskStore((state) => state.setTasks);

  return useQuery({
    queryKey: queryKeys.tasks.all,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      return data as Task[];
    },
    onSuccess: (data) => {
      setTasks(data);
    },
  });
}

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { activeTasks, addTask } = useTaskStore();

  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Determine status and priority based on active task count
      const isAtCapacity = activeTasks.length >= TASK_CONSTRAINTS.MAX_ACTIVE_TASKS;
      const status = input.status ?? (isAtCapacity ? 'idea' : 'active');
      const priority = status === 'active' ? activeTasks.length + 1 : null;

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          text: input.text,
          status,
          priority,
          is_from_yesterday: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule clarity prompt for ideas
      if (status === 'idea') {
        scheduleClarityPrompt(input.text);
      }

      return data as Task;
    },
    onMutate: async (input) => {
      haptics.light();
    },
    onSuccess: (data) => {
      addTask(data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const updateTask = useTaskStore((state) => state.updateTask);

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      updateTask(data.id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Complete a task (shredder action)
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const updateTask = useTaskStore((state) => state.updateTask);
  const incrementStreak = useUserStore((state) => state.incrementStreak);

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'done',
          completed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Call edge function to update streak
      await supabase.functions.invoke('complete-task', {
        body: { id },
      });

      return data as Task;
    },
    onMutate: async () => {
      haptics.heavy();
    },
    onSuccess: (data) => {
      updateTask(data.id, data);
      incrementStreak();
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.user.streak });
    },
  });
}

/**
 * Promote a task from idea to active
 */
export function usePromoteTask() {
  const queryClient = useQueryClient();
  const { activeTasks, updateTask } = useTaskStore();

  return useMutation({
    mutationFn: async (input: PromoteTaskInput) => {
      if (activeTasks.length >= TASK_CONSTRAINTS.MAX_ACTIVE_TASKS) {
        throw new Error('Maximum active tasks reached. Complete one to add more.');
      }

      const priority = input.priority ?? activeTasks.length + 1;

      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'active',
          priority,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onMutate: async () => {
      haptics.medium();
    },
    onSuccess: (data) => {
      updateTask(data.id, data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const removeTask = useTaskStore((state) => state.removeTask);

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      removeTask(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}

/**
 * Reorder tasks
 */
export function useReorderTasks() {
  const queryClient = useQueryClient();
  const reorderTasks = useTaskStore((state) => state.reorderTasks);

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('reorder-tasks', {
        body: { task_ids: taskIds },
      });

      if (error) throw error;
      return data as Task[];
    },
    onMutate: async (taskIds) => {
      // Optimistic update
      reorderTasks(taskIds);
      haptics.selection();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
