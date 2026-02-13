'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings, Plus } from 'lucide-react'
import { DndContext, closestCenter, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { getPositionBetween } from '@/lib/position'
import TaskList from '@/components/tasks/TaskList'
import TaskInput from '@/components/tasks/TaskInput'
import ProjectEditDialog from '@/components/projects/ProjectEditDialog'
import Spinner from '@/components/ui/Spinner'
import type { Project, Task } from '@/types'

interface ProjectViewProps {
  project: Project
}

export default function ProjectView({ project }: ProjectViewProps) {
  const { fetchTasksByProject, getTasksByProject, reorderTask, tasks, isLoading } = useTaskStore()
  const { sections, fetchSections, createSection } = useProjectStore()
  const [showEdit, setShowEdit] = useState(false)
  const [addingSectionName, setAddingSectionName] = useState('')
  const [showAddSection, setShowAddSection] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  useEffect(() => {
    fetchTasksByProject(project.id)
    fetchSections(project.id)
  }, [project.id])

  const projectSections = sections[project.id] || []
  const unsectionedTasks = getTasksByProject(project.id, null)

  const findTaskSectionId = (taskId: string): string | null => {
    const task = tasks[taskId]
    return task?.section_id || null
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Determine target section: either the over item's section or a droppable section container
    const activeTask = tasks[activeId]
    if (!activeTask) return

    let targetSectionId: string | null = null
    let targetTasks: Task[]

    // Check if dropped over a section droppable container
    if (overId.startsWith('section:')) {
      targetSectionId = overId.replace('section:', '')
      if (targetSectionId === 'unsectioned') targetSectionId = null
      targetTasks = getTasksByProject(project.id, targetSectionId)
    } else {
      // Dropped over another task - get that task's section
      const overTask = tasks[overId]
      if (!overTask) return
      targetSectionId = overTask.section_id
      targetTasks = getTasksByProject(project.id, targetSectionId)
    }

    // Calculate new position
    const overTask = tasks[overId]
    let newPosition: number

    if (overId.startsWith('section:')) {
      // Dropped on empty section container, put at end
      const lastPos = targetTasks.length > 0
        ? Math.max(...targetTasks.map((t) => t.position))
        : 0
      newPosition = lastPos + 65536
    } else if (overTask) {
      const overIndex = targetTasks.findIndex((t) => t.id === overId)
      const filteredTasks = targetTasks.filter((t) => t.id !== activeId)

      if (overIndex <= 0) {
        newPosition = filteredTasks.length > 0
          ? filteredTasks[0].position / 2
          : 65536
      } else {
        const before = filteredTasks[Math.min(overIndex - 1, filteredTasks.length - 1)]
        const after = filteredTasks[overIndex] || null
        newPosition = getPositionBetween(
          before?.position ?? null,
          after?.position ?? null
        )
      }
    } else {
      newPosition = 65536
    }

    reorderTask(activeId, newPosition, targetSectionId)
  }, [tasks, project.id, getTasksByProject, reorderTask])

  const handleAddSection = async () => {
    if (!addingSectionName.trim()) return
    await createSection({
      project_id: project.id,
      name: addingSectionName.trim(),
    })
    setAddingSectionName('')
    setShowAddSection(false)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size={24} />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event: DragStartEvent) => setActiveTaskId(event.active.id as string)}
      onDragEnd={(event: DragEndEvent) => {
        setActiveTaskId(null)
        handleDragEnd(event)
      }}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
        </div>
        {!project.is_inbox && (
          <button
            onClick={() => setShowEdit(true)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <Settings size={16} />
          </button>
        )}
      </div>

      {/* Unsectioned tasks */}
      <TaskList
        tasks={unsectionedTasks}
        droppableId="section:unsectioned"
        draggable
      />
      <div className="mt-2 mb-6">
        <TaskInput projectId={project.id} />
      </div>

      {/* Sections */}
      {projectSections.map((section) => {
        const sectionTasks = getTasksByProject(project.id, section.id)
        return (
          <div key={section.id} className="mb-6">
            <div className="flex items-center gap-2 mb-2 border-b border-gray-200 pb-2">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                {section.name}
              </h3>
              <span className="text-xs text-gray-400">{sectionTasks.length}</span>
            </div>
            <TaskList
              tasks={sectionTasks}
              droppableId={`section:${section.id}`}
              draggable
            />
            <div className="mt-2">
              <TaskInput projectId={project.id} sectionId={section.id} />
            </div>
          </div>
        )
      })}

      {/* Add section */}
      {showAddSection ? (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={addingSectionName}
            onChange={(e) => setAddingSectionName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection()
              if (e.key === 'Escape') setShowAddSection(false)
            }}
            placeholder="Section name"
            className="flex-1 text-sm border border-gray-200 rounded-md px-3 py-1.5 outline-none focus:border-gray-300"
            autoFocus
          />
          <button
            onClick={handleAddSection}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600"
          >
            Add
          </button>
          <button
            onClick={() => setShowAddSection(false)}
            className="text-xs text-gray-500 px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddSection(true)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mt-4 transition-colors"
        >
          <Plus size={16} />
          Add section
        </button>
      )}

      {!project.is_inbox && (
        <ProjectEditDialog
          open={showEdit}
          onClose={() => setShowEdit(false)}
          project={project}
        />
      )}

      <DragOverlay>
        {activeTaskId && tasks[activeTaskId] ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 opacity-90">
            <p className="text-sm text-gray-900">{tasks[activeTaskId].title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
