import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Project, Section, CreateProjectInput, UpdateProjectInput, CreateSectionInput, UpdateSectionInput } from '@/types'
import { getPositionAtEnd } from '@/lib/position'

interface ProjectState {
  projects: Project[]
  sections: Record<string, Section[]>
  isLoading: boolean
  fetchProjects: () => Promise<void>
  fetchSections: (projectId: string) => Promise<void>
  createProject: (data: CreateProjectInput) => Promise<Project | null>
  updateProject: (id: string, data: UpdateProjectInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  createSection: (data: CreateSectionInput) => Promise<Section | null>
  updateSection: (id: string, data: UpdateSectionInput) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  getInboxProject: () => Project | undefined
  getProjectById: (id: string) => Project | undefined
  handleRealtimeChange: (table: string, eventType: string, record: Record<string, unknown>) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  sections: {},
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true })
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_archived', false)
      .order('position', { ascending: true })

    if (!error && data) {
      set({ projects: data, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  fetchSections: async (projectId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('project_id', projectId)
      .order('position', { ascending: true })

    if (!error && data) {
      set((state) => ({
        sections: { ...state.sections, [projectId]: data },
      }))
    }
  },

  createProject: async (input: CreateProjectInput) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { projects } = get()
    const lastPos = projects.length > 0
      ? Math.max(...projects.map((p) => p.position))
      : 0

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: input.name,
        color: input.color || '#808080',
        position: getPositionAtEnd(lastPos),
      })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({ projects: [...state.projects, data] }))
      return data
    }
    return null
  },

  updateProject: async (id: string, input: UpdateProjectInput) => {
    const supabase = createClient()
    const prev = get().projects
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...input } : p
      ),
    }))

    const { error } = await supabase
      .from('projects')
      .update(input)
      .eq('id', id)

    if (error) {
      set({ projects: prev })
    }
  },

  deleteProject: async (id: string) => {
    const supabase = createClient()
    const prev = get().projects
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }))

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      set({ projects: prev })
    }
  },

  createSection: async (input: CreateSectionInput) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const sections = get().sections[input.project_id] || []
    const lastPos = sections.length > 0
      ? Math.max(...sections.map((s) => s.position))
      : 0

    const { data, error } = await supabase
      .from('sections')
      .insert({
        project_id: input.project_id,
        user_id: user.id,
        name: input.name,
        position: getPositionAtEnd(lastPos),
      })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({
        sections: {
          ...state.sections,
          [input.project_id]: [...(state.sections[input.project_id] || []), data],
        },
      }))
      return data
    }
    return null
  },

  updateSection: async (id: string, input: UpdateSectionInput) => {
    const supabase = createClient()
    const prevSections = { ...get().sections }

    set((state) => {
      const newSections = { ...state.sections }
      for (const projectId in newSections) {
        newSections[projectId] = newSections[projectId].map((s) =>
          s.id === id ? { ...s, ...input } : s
        )
      }
      return { sections: newSections }
    })

    const { error } = await supabase
      .from('sections')
      .update(input)
      .eq('id', id)

    if (error) {
      set({ sections: prevSections })
    }
  },

  deleteSection: async (id: string) => {
    const supabase = createClient()
    const prevSections = { ...get().sections }

    set((state) => {
      const newSections = { ...state.sections }
      for (const projectId in newSections) {
        newSections[projectId] = newSections[projectId].filter((s) => s.id !== id)
      }
      return { sections: newSections }
    })

    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id)

    if (error) {
      set({ sections: prevSections })
    }
  },

  getInboxProject: () => get().projects.find((p) => p.is_inbox),
  getProjectById: (id: string) => get().projects.find((p) => p.id === id),

  handleRealtimeChange: (table, eventType, record) => {
    if (table === 'projects') {
      const project = record as unknown as Project
      if (eventType === 'INSERT') {
        set((state) => {
          if (state.projects.some((p) => p.id === project.id)) return state
          return { projects: [...state.projects, project] }
        })
      } else if (eventType === 'UPDATE') {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? { ...p, ...project } : p
          ),
        }))
      } else if (eventType === 'DELETE') {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== project.id),
        }))
      }
    } else if (table === 'sections') {
      const section = record as unknown as Section
      if (eventType === 'INSERT') {
        set((state) => {
          const existing = state.sections[section.project_id] || []
          if (existing.some((s) => s.id === section.id)) return state
          return {
            sections: {
              ...state.sections,
              [section.project_id]: [...existing, section],
            },
          }
        })
      } else if (eventType === 'UPDATE') {
        set((state) => {
          const newSections = { ...state.sections }
          for (const pid in newSections) {
            newSections[pid] = newSections[pid].map((s) =>
              s.id === section.id ? { ...s, ...section } : s
            )
          }
          return { sections: newSections }
        })
      } else if (eventType === 'DELETE') {
        set((state) => {
          const newSections = { ...state.sections }
          for (const pid in newSections) {
            newSections[pid] = newSections[pid].filter((s) => s.id !== section.id)
          }
          return { sections: newSections }
        })
      }
    }
  },
}))
