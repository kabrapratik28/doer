'use client'

import { useState } from 'react'
import { MoreHorizontal, Trash2, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { cn, formatDueDate, getDueDateColor } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import TaskCheckbox from '@/components/tasks/TaskCheckbox'
import DropdownMenu, { DropdownItem } from '@/components/ui/DropdownMenu'
import type { Task } from '@/types'

interface TaskItemProps {
  task: Task
  showProject?: boolean
  draggable?: boolean
}

export default function TaskItem({ task, showProject, draggable = false }: TaskItemProps) {
  const [completing, setCompleting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { toggleComplete, deleteTask, getSubTasks } = useTaskStore()
  const { openTaskDetail } = useUIStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !draggable,
    data: { type: 'task', task },
  })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined

  const subTasks = getSubTasks(task.id)
  const completedSubTasks = subTasks.filter((t) => t.is_completed).length
  const hasSubTasks = subTasks.length > 0

  const handleToggle = () => {
    if (task.is_completed) {
      toggleComplete(task.id)
      return
    }
    setCompleting(true)
    setTimeout(() => {
      toggleComplete(task.id)
    }, 600)
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        className={cn(
          'group flex items-start gap-2 px-2 py-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0',
          completing && 'task-completing',
          isDragging && 'opacity-50 bg-gray-50 shadow-sm'
        )}
        onClick={() => openTaskDetail(task.id)}
      >
        {/* Drag handle */}
        {draggable && (
          <button
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="pt-1 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
          >
            <GripVertical size={14} />
          </button>
        )}

        <div className="pt-0.5 shrink-0">
          <TaskCheckbox
            priority={task.priority}
            checked={task.is_completed || completing}
            onChange={handleToggle}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm text-gray-900 leading-snug',
              (task.is_completed || completing) && 'line-through text-gray-400'
            )}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.due_date && (
              <span className={cn('text-xs', getDueDateColor(task.due_date))}>
                {formatDueDate(task.due_date)}
              </span>
            )}

            {showProject && task.project && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: task.project.color }}
                />
                {task.project.name}
              </span>
            )}

            {task.labels && task.labels.length > 0 && (
              <>
                {task.labels.map((label) => (
                  <span
                    key={label.id}
                    className="text-xs px-1.5 py-0.5 rounded-md"
                    style={{
                      backgroundColor: label.color + '20',
                      color: label.color,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </>
            )}

            {hasSubTasks && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setExpanded(!expanded)
                }}
                className="text-xs text-gray-400 flex items-center gap-0.5 hover:text-gray-600"
              >
                {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {completedSubTasks}/{subTasks.length}
              </button>
            )}
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <DropdownMenu
            align="right"
            trigger={
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <MoreHorizontal size={16} />
              </button>
            }
          >
            <DropdownItem
              onClick={() => {
                deleteTask(task.id)
              }}
              danger
            >
              <Trash2 size={14} />
              Delete task
            </DropdownItem>
          </DropdownMenu>
        </div>
      </div>

      {/* Sub-tasks */}
      {expanded && hasSubTasks && (
        <div className="ml-7">
          {subTasks.map((sub) => (
            <TaskItem key={sub.id} task={sub} />
          ))}
        </div>
      )}
    </div>
  )
}
