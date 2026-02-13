'use client'

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import TaskItem from '@/components/tasks/TaskItem'
import type { Task } from '@/types'

interface TaskListProps {
  tasks: Task[]
  showProject?: boolean
  emptyMessage?: string
  droppableId?: string
  draggable?: boolean
}

export default function TaskList({ tasks, showProject, emptyMessage, droppableId, draggable = false }: TaskListProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId || 'default',
    disabled: !droppableId,
  })

  if (tasks.length === 0 && emptyMessage) {
    return (
      <div ref={droppableId ? setNodeRef : undefined} className={isOver ? 'bg-blue-50 rounded-lg' : ''}>
        <p className="text-sm text-gray-400 py-4 px-2">{emptyMessage}</p>
      </div>
    )
  }

  const content = (
    <div
      ref={droppableId ? setNodeRef : undefined}
      className={isOver ? 'bg-blue-50/50 rounded-lg transition-colors' : 'transition-colors'}
    >
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} showProject={showProject} draggable={draggable} />
      ))}
    </div>
  )

  if (draggable) {
    return (
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {content}
      </SortableContext>
    )
  }

  return content
}
