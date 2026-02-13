import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Task, CreateTaskInput, UpdateTaskInput, Priority } from '@/types'
import { getPositionAtEnd, getPositionBetween } from '@/lib/position'

interface TaskState {
  tasks: Record<string, Task>
  isLoading: boolean
  fetchTasksByProject: (projectId: string) => Promise<void>
  fetchTasksForToday: () => Promise<void>
  fetchTasksForUpcoming: () => Promise<void>
  createTask: (data: CreateTaskInput) => Promise<Task | null>
  updateTask: (id: string, data: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleComplete: (id: string) => Promise<void>
  reorderTask: (id: string, newPosition: number, newSectionId?: string | null) => Promise<void>
  createSubTask: (parentId: string, data: CreateTaskInput) => Promise<Task | null>
  addLabel: (taskId: string, labelId: string) => Promise<void>
  removeLabel: (taskId: string, labelId: string) => Promise<void>
  getTasksByProject: (projectId: string, sectionId?: string | null) => Task[]
  getSubTasks: (parentId: string) => Task[]
  getTodayTasks: () => Task[]
  getOverdueTasks: () => Task[]
  getUpcomingTasks: () => Task[]
  handleRealtimeChange: (eventType: string, record: Record<string, unknown>, oldRecord?: Record<string, unknown>) => void
}

const supabase = createClient()

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: {},
  isLoading: false,

  fetchTasksByProject: async (projectId: string) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        labels:task_labels(label_id, labels:labels(*))
      `)
      .eq('project_id', projectId)
      .eq('is_completed', false)
      .order('position', { ascending: true })

    if (!error && data) {
      const tasksMap = { ...get().tasks }
      data.forEach((t: Record<string, unknown>) => {
        const taskLabels = (t.labels as Array<{ labels: Record<string, unknown> }>) || []
        tasksMap[t.id as string] = {
          ...t,
          labels: taskLabels.map((tl) => tl.labels),
        } as unknown as Task
      })
      set({ tasks: tasksMap, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  fetchTasksForToday: async () => {
    set({ isLoading: true })
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        labels:task_labels(label_id, labels:labels(*)),
        project:projects(id, name, color)
      `)
      .lte('due_date', today)
      .eq('is_completed', false)
      .is('parent_task_id', null)
      .order('due_date', { ascending: true })
      .order('priority', { ascending: true })

    if (!error && data) {
      const tasksMap = { ...get().tasks }
      data.forEach((t: Record<string, unknown>) => {
        const taskLabels = (t.labels as Array<{ labels: Record<string, unknown> }>) || []
        tasksMap[t.id as string] = {
          ...t,
          labels: taskLabels.map((tl) => tl.labels),
        } as unknown as Task
      })
      set({ tasks: tasksMap, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  fetchTasksForUpcoming: async () => {
    set({ isLoading: true })
    const today = new Date().toISOString().split('T')[0]
    const end = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        labels:task_labels(label_id, labels:labels(*)),
        project:projects(id, name, color)
      `)
      .gte('due_date', today)
      .lte('due_date', end)
      .eq('is_completed', false)
      .is('parent_task_id', null)
      .order('due_date', { ascending: true })
      .order('priority', { ascending: true })

    if (!error && data) {
      const tasksMap = { ...get().tasks }
      data.forEach((t: Record<string, unknown>) => {
        const taskLabels = (t.labels as Array<{ labels: Record<string, unknown> }>) || []
        tasksMap[t.id as string] = {
          ...t,
          labels: taskLabels.map((tl) => tl.labels),
        } as unknown as Task
      })
      set({ tasks: tasksMap, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  createTask: async (input: CreateTaskInput) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const existingTasks = Object.values(get().tasks).filter(
      (t) => t.project_id === input.project_id && t.section_id === (input.section_id || null)
    )
    const lastPos = existingTasks.length > 0
      ? Math.max(...existingTasks.map((t) => t.position))
      : 0

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || '',
        project_id: input.project_id,
        section_id: input.section_id || null,
        parent_task_id: input.parent_task_id || null,
        priority: input.priority || 4,
        due_date: input.due_date || null,
        position: getPositionAtEnd(lastPos),
      })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        tasks: { ...state.tasks, [data.id]: { ...data, labels: [], sub_tasks: [] } },
      }))
      return data as Task
    }
    return null
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    const prev = { ...get().tasks[id] }
    if (!prev.id) return

    set((state) => ({
      tasks: { ...state.tasks, [id]: { ...state.tasks[id], ...input } },
    }))

    const { error } = await supabase
      .from('tasks')
      .update(input)
      .eq('id', id)

    if (error) {
      set((state) => ({ tasks: { ...state.tasks, [id]: prev } }))
    }
  },

  deleteTask: async (id: string) => {
    const prev = get().tasks[id]
    if (!prev) return

    set((state) => {
      const newTasks = { ...state.tasks }
      delete newTasks[id]
      // Also remove sub-tasks
      Object.keys(newTasks).forEach((tid) => {
        if (newTasks[tid].parent_task_id === id) {
          delete newTasks[tid]
        }
      })
      return { tasks: newTasks }
    })

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      set((state) => ({ tasks: { ...state.tasks, [id]: prev } }))
    }
  },

  toggleComplete: async (id: string) => {
    const task = get().tasks[id]
    if (!task) return

    const wasCompleted = task.is_completed
    const update = {
      is_completed: !wasCompleted,
      completed_at: wasCompleted ? null : new Date().toISOString(),
    }

    set((state) => ({
      tasks: { ...state.tasks, [id]: { ...task, ...update } },
    }))

    const { error } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)

    if (error) {
      set((state) => ({ tasks: { ...state.tasks, [id]: task } }))
    }
  },

  reorderTask: async (id: string, newPosition: number, newSectionId?: string | null) => {
    const task = get().tasks[id]
    if (!task) return

    const update: Record<string, unknown> = { position: newPosition }
    if (newSectionId !== undefined) {
      update.section_id = newSectionId
    }

    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: { ...state.tasks[id], ...update } as Task,
      },
    }))

    const { error } = await supabase
      .from('tasks')
      .update(update)
      .eq('id', id)

    if (error) {
      set((state) => ({ tasks: { ...state.tasks, [id]: task } }))
    }
  },

  createSubTask: async (parentId: string, data: CreateTaskInput) => {
    const parent = get().tasks[parentId]
    if (!parent) return null

    return get().createTask({
      ...data,
      project_id: parent.project_id,
      section_id: parent.section_id,
      parent_task_id: parentId,
    })
  },

  addLabel: async (taskId: string, labelId: string) => {
    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId })

    if (!error) {
      // Refetch task labels
      const { data } = await supabase
        .from('labels')
        .select('*')
        .eq('id', labelId)
        .single()

      if (data) {
        set((state) => {
          const task = state.tasks[taskId]
          if (!task) return state
          return {
            tasks: {
              ...state.tasks,
              [taskId]: {
                ...task,
                labels: [...(task.labels || []), data],
              },
            },
          }
        })
      }
    }
  },

  removeLabel: async (taskId: string, labelId: string) => {
    const task = get().tasks[taskId]
    const prevLabels = task?.labels ? [...task.labels] : []

    set((state) => {
      const t = state.tasks[taskId]
      if (!t) return state
      return {
        tasks: {
          ...state.tasks,
          [taskId]: {
            ...t,
            labels: (t.labels || []).filter((l) => l.id !== labelId),
          },
        },
      }
    })

    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId)

    if (error) {
      set((state) => {
        const t = state.tasks[taskId]
        if (!t) return state
        return {
          tasks: { ...state.tasks, [taskId]: { ...t, labels: prevLabels } },
        }
      })
    }
  },

  getTasksByProject: (projectId: string, sectionId?: string | null) => {
    const tasks = Object.values(get().tasks)
    return tasks
      .filter((t) => {
        if (t.project_id !== projectId) return false
        if (t.parent_task_id !== null) return false
        if (sectionId === undefined) return true
        return t.section_id === sectionId
      })
      .sort((a, b) => a.position - b.position)
  },

  getSubTasks: (parentId: string) => {
    return Object.values(get().tasks)
      .filter((t) => t.parent_task_id === parentId)
      .sort((a, b) => a.position - b.position)
  },

  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    return Object.values(get().tasks)
      .filter(
        (t) =>
          t.due_date === today &&
          !t.is_completed &&
          !t.parent_task_id
      )
      .sort((a, b) => (a.priority as number) - (b.priority as number))
  },

  getOverdueTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    return Object.values(get().tasks)
      .filter(
        (t) =>
          t.due_date !== null &&
          t.due_date < today &&
          !t.is_completed &&
          !t.parent_task_id
      )
      .sort((a, b) => (a.priority as number) - (b.priority as number))
  },

  getUpcomingTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    const end = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
    return Object.values(get().tasks)
      .filter(
        (t) =>
          t.due_date !== null &&
          t.due_date >= today &&
          t.due_date <= end &&
          !t.is_completed &&
          !t.parent_task_id
      )
      .sort((a, b) => {
        if (a.due_date !== b.due_date) return a.due_date! < b.due_date! ? -1 : 1
        return (a.priority as number) - (b.priority as number)
      })
  },

  handleRealtimeChange: (eventType, record, oldRecord) => {
    const task = record as unknown as Task
    if (eventType === 'INSERT') {
      set((state) => {
        if (state.tasks[task.id]) return state
        return { tasks: { ...state.tasks, [task.id]: { ...task, labels: [] } } }
      })
    } else if (eventType === 'UPDATE') {
      set((state) => {
        const existing = state.tasks[task.id]
        if (!existing) return state
        return {
          tasks: {
            ...state.tasks,
            [task.id]: { ...existing, ...task, labels: existing.labels },
          },
        }
      })
    } else if (eventType === 'DELETE') {
      const old = oldRecord as unknown as Task | undefined
      const taskId = old?.id || task.id
      if (taskId) {
        set((state) => {
          const newTasks = { ...state.tasks }
          delete newTasks[taskId]
          return { tasks: newTasks }
        })
      }
    }
  },
}))
