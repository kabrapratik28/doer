'use client'

import { useEffect } from 'react'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/tasks/TaskList'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

export default function TodayView() {
  const { fetchTasksForToday, getTodayTasks, getOverdueTasks, isLoading } = useTaskStore()

  useEffect(() => {
    fetchTasksForToday()
  }, [])

  const todayTasks = getTodayTasks()
  const overdueTasks = getOverdueTasks()

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  if (todayTasks.length === 0 && overdueTasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={48} />}
        title="All clear for today!"
        description="Enjoy your day or add some tasks to stay productive."
      />
    )
  }

  return (
    <div>
      {overdueTasks.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-red-600 mb-2 uppercase tracking-wider flex items-center gap-2">
            Overdue
            <span className="text-xs font-normal bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
              {overdueTasks.length}
            </span>
          </h2>
          <TaskList tasks={overdueTasks} showProject />
        </div>
      )}

      {todayTasks.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2">
            Today
            <span className="text-xs font-normal bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
              {todayTasks.length}
            </span>
          </h2>
          <TaskList tasks={todayTasks} showProject />
        </div>
      )}
    </div>
  )
}
