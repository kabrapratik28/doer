'use client'

import { useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { PROJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface ProjectCreateDialogProps {
  open: boolean
  onClose: () => void
}

export default function ProjectCreateDialog({ open, onClose }: ProjectCreateDialogProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PROJECT_COLORS[0].value)
  const [loading, setLoading] = useState(false)
  const { createProject } = useProjectStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await createProject({ name: name.trim(), color })
    setName('')
    setColor(PROJECT_COLORS[0].value)
    setLoading(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} title="Add project">
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
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim() || loading}>
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
