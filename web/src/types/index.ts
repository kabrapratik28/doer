export type Priority = 1 | 2 | 3 | 4

export type ViewType = 'today' | 'upcoming' | 'inbox' | 'project'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  color: string
  is_inbox: boolean
  is_archived: boolean
  position: number
  created_at: string
  updated_at: string
}

export interface Section {
  id: string
  project_id: string
  user_id: string
  name: string
  position: number
  is_collapsed: boolean
  created_at: string
  updated_at: string
}

export interface Label {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  project_id: string
  section_id: string | null
  parent_task_id: string | null
  title: string
  description: string
  priority: Priority
  is_completed: boolean
  completed_at: string | null
  due_date: string | null
  position: number
  created_at: string
  updated_at: string
  // Joined relations
  labels?: Label[]
  sub_tasks?: Task[]
  project?: Pick<Project, 'id' | 'name' | 'color'>
}

export interface CreateTaskInput {
  title: string
  description?: string
  project_id: string
  section_id?: string | null
  parent_task_id?: string | null
  priority?: Priority
  due_date?: string | null
  position?: number
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  project_id?: string
  section_id?: string | null
  priority?: Priority
  is_completed?: boolean
  completed_at?: string | null
  due_date?: string | null
  position?: number
}

export interface CreateProjectInput {
  name: string
  color?: string
}

export interface UpdateProjectInput {
  name?: string
  color?: string
  is_archived?: boolean
  position?: number
}

export interface CreateSectionInput {
  project_id: string
  name: string
  position?: number
}

export interface UpdateSectionInput {
  name?: string
  position?: number
  is_collapsed?: boolean
}

export interface CreateLabelInput {
  name: string
  color?: string
}

export interface UpdateLabelInput {
  name?: string
  color?: string
}
