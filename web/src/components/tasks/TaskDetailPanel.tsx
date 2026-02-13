'use client'

import { useState, useEffect } from 'react'
import { Trash2, Flag, Calendar, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PRIORITY_COLORS } from '@/lib/constants'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useLabelStore } from '@/stores/labelStore'
import Dialog from '@/components/ui/Dialog'
import TaskInput from '@/components/tasks/TaskInput'
import TaskCheckbox from '@/components/tasks/TaskCheckbox'
import type { Priority } from '@/types'

interface TaskDetailPanelProps {
  taskId: string
  onClose: () => void
}

export default function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { tasks, updateTask, deleteTask, toggleComplete, getSubTasks, addLabel, removeLabel } = useTaskStore()
  const { projects } = useProjectStore()
  const { labels: allLabels } = useLabelStore()

  const task = tasks[taskId]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>(4)
  const [dueDate, setDueDate] = useState('')
  const [projectId, setProjectId] = useState('')

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setDueDate(task.due_date || '')
      setProjectId(task.project_id)
    }
  }, [task])

  if (!task) return null

  const subTasks = getSubTasks(taskId)
  const taskLabels = task.labels || []

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      updateTask(taskId, { title: title.trim() })
    }
  }

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(taskId, { description })
    }
  }

  const handlePriorityChange = (p: Priority) => {
    setPriority(p)
    updateTask(taskId, { priority: p })
  }

  const handleDueDateChange = (date: string) => {
    setDueDate(date)
    updateTask(taskId, { due_date: date || null })
  }

  const handleProjectChange = (pid: string) => {
    setProjectId(pid)
    updateTask(taskId, { project_id: pid, section_id: null })
  }

  const handleDelete = () => {
    deleteTask(taskId)
    onClose()
  }

  const toggleLabel = (labelId: string) => {
    const hasLabel = taskLabels.some((l) => l.id === labelId)
    if (hasLabel) {
      removeLabel(taskId, labelId)
    } else {
      addLabel(taskId, labelId)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} raw className="max-w-xl max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <TaskCheckbox
            priority={task.priority}
            checked={task.is_completed}
            onChange={() => toggleComplete(taskId)}
          />
          <span className="text-sm text-gray-500">
            {projects.find((p) => p.id === task.project_id)?.name || 'Inbox'}
          </span>
        </div>
        <button
          onClick={handleDelete}
          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          className="w-full text-lg font-medium text-gray-900 outline-none bg-transparent"
          placeholder="Task name"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionBlur}
          className="w-full text-sm text-gray-600 outline-none bg-transparent resize-none min-h-[60px]"
          placeholder="Description"
          rows={3}
        />

        {/* Properties */}
        <div className="space-y-3 border-t border-gray-100 pt-4">
          {/* Project */}
          <div className="flex items-center gap-3">
            <FolderOpen size={16} className="text-gray-400 shrink-0" />
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="flex-1 text-sm text-gray-700 bg-transparent outline-none border border-gray-200 rounded-md px-2 py-1.5"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-gray-400 shrink-0" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="flex-1 text-sm text-gray-700 bg-transparent outline-none border border-gray-200 rounded-md px-2 py-1.5"
            />
          </div>

          {/* Priority */}
          <div className="flex items-center gap-3">
            <Flag size={16} className="text-gray-400 shrink-0" />
            <div className="flex gap-1">
              {([1, 2, 3, 4] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePriorityChange(p)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    priority === p
                      ? 'text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  )}
                  style={
                    priority === p
                      ? { backgroundColor: PRIORITY_COLORS[p] }
                      : undefined
                  }
                >
                  P{p}
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          {allLabels.length > 0 && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1 shrink-0 w-4">
                @
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allLabels.map((label) => {
                  const isActive = taskLabels.some((l) => l.id === label.id)
                  return (
                    <button
                      key={label.id}
                      onClick={() => toggleLabel(label.id)}
                      className={cn(
                        'text-xs px-2 py-1 rounded-full border transition-colors',
                        isActive
                          ? 'border-transparent text-white'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      )}
                      style={
                        isActive
                          ? { backgroundColor: label.color }
                          : undefined
                      }
                    >
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sub-tasks */}
        {!task.parent_task_id && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sub-tasks</h3>
            {subTasks.length > 0 && (
              <div className="mb-2 space-y-1">
                {subTasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50"
                  >
                    <TaskCheckbox
                      priority={sub.priority}
                      checked={sub.is_completed}
                      onChange={() => toggleComplete(sub.id)}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        sub.is_completed && 'line-through text-gray-400'
                      )}
                    >
                      {sub.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <TaskInput
              projectId={task.project_id}
              sectionId={task.section_id}
              parentTaskId={taskId}
              placeholder="Add sub-task..."
            />
          </div>
        )}
      </div>
    </Dialog>
  )
}
