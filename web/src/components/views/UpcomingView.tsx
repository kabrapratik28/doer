'use client'

import { useEffect, useMemo } from 'react'
import { CalendarDays, CheckCircle2 } from 'lucide-react'
import { format, addDays, startOfDay } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/tasks/TaskList'
import EmptyState from '@/components/ui/EmptyState'
import Spinner from '@/components/ui/Spinner'

export default function UpcomingView() {
  const { fetchTasksForUpcoming, getUpcomingTasks, isLoading } = useTaskStore()

  useEffect(() => {
    fetchTasksForUpcoming()
  }, [])

  const upcomingTasks = getUpcomingTasks()

  const groupedByDay = useMemo(() => {
    const days: { date: Date; dateStr: string; label: string; tasks: typeof upcomingTasks }[] = []
    const today = startOfDay(new Date())

    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEEE, MMM d')
      const tasks = upcomingTasks.filter((t) => t.due_date === dateStr)
      days.push({ date, dateStr, label, tasks })
    }
    return days
  }, [upcomingTasks])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  if (upcomingTasks.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays size={48} />}
        title="No upcoming tasks"
        description="Tasks with due dates in the next 7 days will appear here."
      />
    )
  }

  return (
    <div className="space-y-6">
      {groupedByDay.map((day) => (
        <div key={day.dateStr}>
          <h2 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider flex items-center gap-2 border-b border-gray-100 pb-2">
            {day.label}
            {day.tasks.length > 0 && (
              <span className="text-xs font-normal bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {day.tasks.length}
              </span>
            )}
          </h2>
          {day.tasks.length > 0 ? (
            <TaskList tasks={day.tasks} showProject />
          ) : (
            <p className="text-xs text-gray-300 py-2 px-2">No tasks</p>
          )}
        </div>
      ))}
    </div>
  )
}
