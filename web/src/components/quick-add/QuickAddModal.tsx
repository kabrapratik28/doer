'use client'

import { useState, useRef, useEffect } from 'react'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useLabelStore } from '@/stores/labelStore'
import { useCommandParser } from '@/hooks/useCommandParser'
import CommandDropdown from '@/components/ui/CommandDropdown'
import Dialog from '@/components/ui/Dialog'
import type { Priority, Project, Label } from '@/types'
import { PRIORITY_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface QuickAddModalProps {
  open: boolean
  onClose: () => void
}

export default function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [priority, setPriority] = useState<Priority>(4)
  const [dueDate, setDueDate] = useState('')
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [cmdActiveIndex, setCmdActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const { createTask, addLabel } = useTaskStore()
  const { projects, getInboxProject } = useProjectStore()
  const { labels: allLabels } = useLabelStore()
  const { command, detectCommand, applyCommand, clearCommand } = useCommandParser()

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    if (!open) {
      setTitle('')
      setDescription('')
      setProjectId('')
      setPriority(4)
      setDueDate('')
      setSelectedLabelIds([])
      clearCommand()
    }
  }, [open])

  useEffect(() => {
    setCmdActiveIndex(0)
  }, [command.query, command.type])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    const cursorPos = e.target.selectionStart || value.length
    detectCommand(value, cursorPos)
  }

  const handleSelectProject = (project: Project) => {
    const newTitle = applyCommand(title, project.name)
    setTitle(newTitle)
    setProjectId(project.id)
    clearCommand()
    inputRef.current?.focus()
  }

  const handleSelectLabel = (label: Label) => {
    const newTitle = applyCommand(title, label.name)
    setTitle(newTitle)
    if (!selectedLabelIds.includes(label.id)) {
      setSelectedLabelIds((prev) => [...prev, label.id])
    }
    clearCommand()
    inputRef.current?.focus()
  }

  const getFilteredItems = () => {
    if (command.type === '#') {
      return projects.filter((p) => p.name.toLowerCase().includes(command.query.toLowerCase()))
    }
    if (command.type === '@') {
      return allLabels.filter((l) => l.name.toLowerCase().includes(command.query.toLowerCase()))
    }
    return []
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (command.type) {
      const items = getFilteredItems()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setCmdActiveIndex((prev) => Math.min(prev + 1, items.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setCmdActiveIndex((prev) => Math.max(prev - 1, 0))
        return
      }
      if ((e.key === 'Enter' || e.key === 'Tab') && items.length > 0) {
        e.preventDefault()
        const item = items[cmdActiveIndex]
        if (command.type === '#') {
          handleSelectProject(item as Project)
        } else {
          handleSelectLabel(item as Label)
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        clearCommand()
        return
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    const inbox = getInboxProject()
    const targetProject = projectId || inbox?.id
    if (!targetProject) return

    const result = await createTask({
      title: title.trim(),
      description: description.trim(),
      project_id: targetProject,
      priority,
      due_date: dueDate || null,
    })

    if (result) {
      for (const labelId of selectedLabelIds) {
        await addLabel(result.id, labelId)
      }
    }

    setTitle('')
    setDescription('')
    setPriority(4)
    setDueDate('')
    setSelectedLabelIds([])
    setProjectId('')
    clearCommand()
    setLoading(false)
    onClose()
  }

  const selectedProject = projectId ? projects.find((p) => p.id === projectId) : null

  return (
    <Dialog open={open} onClose={onClose} title="Quick add task">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            placeholder="Task name — type # for project, @ for label"
            className="w-full text-base text-gray-900 outline-none bg-transparent border-b border-gray-200 pb-2 focus:border-gray-400"
          />

          {command.type && (
            <CommandDropdown
              type={command.type}
              query={command.query}
              projects={projects}
              labels={allLabels}
              onSelectProject={handleSelectProject}
              onSelectLabel={handleSelectLabel}
              onClose={clearCommand}
              activeIndex={cmdActiveIndex}
            />
          )}
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="w-full text-sm text-gray-600 outline-none bg-transparent resize-none"
          rows={2}
        />

        {/* Selected project & labels preview */}
        {(selectedProject || selectedLabelIds.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {selectedProject && (
              <span className="text-xs px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                {selectedProject.name}
              </span>
            )}
            {selectedLabelIds.map((id) => {
              const label = allLabels.find((l) => l.id === id)
              if (!label) return null
              return (
                <span
                  key={id}
                  className="text-xs px-1.5 py-0.5 rounded-md cursor-pointer hover:opacity-70"
                  style={{ backgroundColor: label.color + '20', color: label.color }}
                  onClick={() => setSelectedLabelIds((prev) => prev.filter((l) => l !== id))}
                >
                  {label.name} &times;
                </span>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 outline-none bg-white"
          >
            <option value="">Inbox</option>
            {projects
              .filter((p) => !p.is_inbox)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm text-gray-600 border border-gray-200 rounded-md px-2 py-1.5 outline-none"
          />

          <div className="flex gap-1">
            {([1, 2, 3, 4] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'w-7 h-7 rounded-md text-xs font-medium transition-colors flex items-center justify-center',
                  priority === p ? 'text-white' : 'text-gray-500 hover:bg-gray-100 border border-gray-200'
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

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="text-sm bg-red-500 text-white px-4 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
          >
            {loading ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
