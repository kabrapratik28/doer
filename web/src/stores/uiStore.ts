import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  quickAddOpen: boolean
  taskDetailId: string | null
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openQuickAdd: () => void
  closeQuickAdd: () => void
  openTaskDetail: (taskId: string) => void
  closeTaskDetail: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      quickAddOpen: false,
      taskDetailId: null,

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openQuickAdd: () => set({ quickAddOpen: true, taskDetailId: null }),
      closeQuickAdd: () => set({ quickAddOpen: false }),
      openTaskDetail: (taskId) => set({ taskDetailId: taskId, quickAddOpen: false }),
      closeTaskDetail: () => set({ taskDetailId: null }),
    }),
    {
      name: 'doer-ui',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
)
