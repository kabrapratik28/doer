'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Tag } from 'lucide-react'
import { useTaskStore } from '@/stores/taskStore'
import { useProjectStore } from '@/stores/projectStore'
import { useLabelStore } from '@/stores/labelStore'
import { useCommandParser } from '@/hooks/useCommandParser'
import CommandDropdown from '@/components/ui/CommandDropdown'
import { cn } from '@/lib/utils'
import type { Priority, Project, Label } from '@/types'

interface TaskInputProps {
  projectId: string
  sectionId?: string | null
  parentTaskId?: string | null
  placeholder?: string
  autoFocus?: boolean
  onCreated?: () => void
}

export default function TaskInput({
  projectId,
  sectionId,
  parentTaskId,
  placeholder = 'Add a task...',
  autoFocus,
  onCreated,
}: TaskInputProps) {
  const [isOpen, setIsOpen] = useState(autoFocus || false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>(4)
  const [dueDate, setDueDate] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(projectId)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [cmdActiveIndex, setCmdActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const labelPickerRef = useRef<HTMLDivElement>(null)
  const { createTask, createSubTask, addLabel } = useTaskStore()
  const { projects } = useProjectStore()
  const { labels: allLabels } = useLabelStore()
  const { command, detectCommand, applyCommand, clearCommand } = useCommandParser()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    setSelectedProjectId(projectId)
  }, [projectId])

  useEffect(() => {
    setCmdActiveIndex(0)
  }, [command.query, command.type])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (labelPickerRef.current && !labelPickerRef.current.contains(e.target as Node)) {
        setShowLabelPicker(false)
      }
    }
    if (showLabelPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showLabelPicker])

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setTitle(value)
    const cursorPos = e.target.selectionStart || value.length
    detectCommand(value, cursorPos)
  }

  const handleSelectProject = (project: Project) => {
    const newTitle = applyCommand(title, project.name)
    setTitle(newTitle)
    setSelectedProjectId(project.id)
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

  const handleSubmit = async () => {
    if (!title.trim()) return

    const input = {
      title: title.trim(),
      project_id: selectedProjectId,
      section_id: sectionId || null,
      priority,
      due_date: dueDate || null,
    }

    let result
    if (parentTaskId) {
      result = await createSubTask(parentTaskId, input)
    } else {
      result = await createTask(input)
    }

    if (result) {
      for (const labelId of selectedLabelIds) {
        await addLabel(result.id, labelId)
      }
      setTitle('')
      setPriority(4)
      setDueDate('')
      setSelectedLabelIds([])
      setSelectedProjectId(projectId)
      clearCommand()
      onCreated?.()
    }
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

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
      setTitle('')
      setSelectedLabelIds([])
      setSelectedProjectId(projectId)
      clearCommand()
    }
  }

  const toggleLabelId = (id: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 w-full px-2 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-gray-50 group"
      >
        <span className="flex items-center justify-center w-[18px] h-[18px] rounded-full border border-dashed border-gray-300 group-hover:border-red-400 group-hover:bg-red-50 transition-colors">
          <Plus size={12} className="text-gray-400 group-hover:text-red-500" />
        </span>
        {placeholder}
      </button>
    )
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="border border-gray-200 rounded-lg p-3 focus-within:border-gray-300 transition-colors">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleKeyDown}
          placeholder="Task name — type # for project, @ for label"
          className="w-full text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent"
        />

        {/* Command dropdown */}
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

      {/* Selected project & labels preview */}
      {(selectedProjectId !== projectId || selectedLabelIds.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {selectedProjectId !== projectId && selectedProject && (
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
                onClick={() => toggleLabelId(id)}
              >
                {label.name} &times;
              </span>
            )
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {!parentTaskId && (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="text-xs text-gray-500 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-gray-300 bg-white max-w-[120px]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.is_inbox ? 'Inbox' : p.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-xs text-gray-500 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-gray-300"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as Priority)}
            className="text-xs text-gray-500 border border-gray-200 rounded-md px-2 py-1 outline-none focus:border-gray-300 bg-white"
          >
            <option value={4}>P4</option>
            <option value={3}>P3</option>
            <option value={2}>P2</option>
            <option value={1}>P1</option>
          </select>

          {allLabels.length > 0 && !parentTaskId && (
            <div className="relative" ref={labelPickerRef}>
              <button
                type="button"
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className={cn(
                  'flex items-center gap-1 text-xs border border-gray-200 rounded-md px-2 py-1 hover:border-gray-300 transition-colors',
                  selectedLabelIds.length > 0 ? 'text-red-500 border-red-200' : 'text-gray-500'
                )}
              >
                <Tag size={12} />
                {selectedLabelIds.length > 0 ? selectedLabelIds.length : 'Labels'}
              </button>
              {showLabelPicker && (
                <div className="absolute left-0 bottom-full mb-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
                  {allLabels.map((label) => {
                    const isSelected = selectedLabelIds.includes(label.id)
                    return (
                      <button
                        key={label.id}
                        onClick={() => toggleLabelId(label.id)}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left hover:bg-gray-50 transition-colors',
                          isSelected && 'bg-gray-50'
                        )}
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="flex-1">{label.name}</span>
                        {isSelected && <span className="text-red-500">&#10003;</span>}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsOpen(false)
              setTitle('')
              setSelectedLabelIds([])
              setSelectedProjectId(projectId)
              clearCommand()
            }}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="text-xs bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add task
          </button>
        </div>
      </div>
    </div>
  )
}
