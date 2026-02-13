'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/authStore'
import { useProjectStore } from '@/stores/projectStore'
import { useLabelStore } from '@/stores/labelStore'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import Sidebar from '@/components/layout/Sidebar'
import AppHeader from '@/components/layout/AppHeader'
import QuickAddModal from '@/components/quick-add/QuickAddModal'
import TaskDetailPanel from '@/components/tasks/TaskDetailPanel'
import Spinner from '@/components/ui/Spinner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { initialize, user } = useAuthStore()
  const { fetchProjects } = useProjectStore()
  const { fetchLabels } = useLabelStore()
  const { sidebarOpen, quickAddOpen, closeQuickAdd, taskDetailId, closeTaskDetail } = useUIStore()

  useEffect(() => {
    const init = async () => {
      await initialize()
      const { user } = useAuthStore.getState()
      if (!user) {
        router.push('/login')
        return
      }
      await Promise.all([fetchProjects(), fetchLabels()])
      setReady(true)
    }
    init()
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    if (!ready) return
    const supabase = createClient()

    const channel = supabase
      .channel('app-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          useTaskStore.getState().handleRealtimeChange(
            payload.eventType,
            (payload.new || {}) as Record<string, unknown>,
            (payload.old || undefined) as Record<string, unknown> | undefined
          )
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload) => {
          useProjectStore.getState().handleRealtimeChange(
            'projects',
            payload.eventType,
            (payload.new || payload.old || {}) as Record<string, unknown>
          )
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sections' },
        (payload) => {
          useProjectStore.getState().handleRealtimeChange(
            'sections',
            payload.eventType,
            (payload.new || payload.old || {}) as Record<string, unknown>
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ready])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'q') {
        e.preventDefault()
        useUIStore.getState().openQuickAdd()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <AppHeader />
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
      {taskDetailId && (
        <TaskDetailPanel taskId={taskDetailId} onClose={closeTaskDetail} />
      )}
      <QuickAddModal open={quickAddOpen} onClose={closeQuickAdd} />
    </div>
  )
}
