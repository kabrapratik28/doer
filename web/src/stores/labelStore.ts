import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Label, CreateLabelInput, UpdateLabelInput } from '@/types'

interface LabelState {
  labels: Label[]
  isLoading: boolean
  fetchLabels: () => Promise<void>
  createLabel: (data: CreateLabelInput) => Promise<Label | null>
  updateLabel: (id: string, data: UpdateLabelInput) => Promise<void>
  deleteLabel: (id: string) => Promise<void>
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  isLoading: false,

  fetchLabels: async () => {
    set({ isLoading: true })
    const supabase = createClient()
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .order('name', { ascending: true })

    if (!error && data) {
      set({ labels: data, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  createLabel: async (input: CreateLabelInput) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('labels')
      .insert({
        user_id: user.id,
        name: input.name,
        color: input.color || '#808080',
      })
      .select()
      .single()

    if (!error && data) {
      set((state) => ({ labels: [...state.labels, data] }))
      return data
    }
    return null
  },

  updateLabel: async (id: string, input: UpdateLabelInput) => {
    const supabase = createClient()
    const prev = get().labels
    set((state) => ({
      labels: state.labels.map((l) => (l.id === id ? { ...l, ...input } : l)),
    }))

    const { error } = await supabase
      .from('labels')
      .update(input)
      .eq('id', id)

    if (error) {
      set({ labels: prev })
    }
  },

  deleteLabel: async (id: string) => {
    const supabase = createClient()
    const prev = get().labels
    set((state) => ({
      labels: state.labels.filter((l) => l.id !== id),
    }))

    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)

    if (error) {
      set({ labels: prev })
    }
  },
}))
