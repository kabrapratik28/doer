'use client'

import { useState, useEffect } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { PROJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

interface ProjectEditDialogProps {
  open: boolean
  onClose: () => void
  project: Project
}

export default function ProjectEditDialog({ open, onClose, project }: ProjectEditDialogProps) {
  const [name, setName] = useState(project.name)
  const [color, setColor] = useState(project.color)
  const [loading, setLoading] = useState(false)
  const { updateProject, deleteProject } = useProjectStore()

  useEffect(() => {
    setName(project.name)
    setColor(project.color)
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await updateProject(project.id, { name: name.trim(), color })
    setLoading(false)
    onClose()
  }

  const handleDelete = async () => {
    if (confirm('Delete this project and all its tasks?')) {
      await deleteProject(project.id)
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="Edit project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all',
                  color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'
                )}
                style={{ backgroundColor: c.value }}
                title={c.name}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  )
}
