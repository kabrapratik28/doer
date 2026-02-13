'use client'

import { useState } from 'react'
import { useLabelStore } from '@/stores/labelStore'
import Dialog from '@/components/ui/Dialog'
import { PROJECT_COLORS } from '@/lib/constants'
import { Trash2, Pencil, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LabelManageDialogProps {
  open: boolean
  onClose: () => void
}

export default function LabelManageDialog({ open, onClose }: LabelManageDialogProps) {
  const { labels, createLabel, updateLabel, deleteLabel } = useLabelStore()
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PROJECT_COLORS[8].value)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  const [showEditColorPicker, setShowEditColorPicker] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    await createLabel({ name: newName.trim(), color: newColor })
    setNewName('')
    setShowColorPicker(false)
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return
    const updates: { name?: string; color?: string } = {}
    const label = labels.find((l) => l.id === id)
    if (editName.trim() !== label?.name) updates.name = editName.trim()
    if (editColor && editColor !== label?.color) updates.color = editColor
    if (Object.keys(updates).length > 0) {
      await updateLabel(id, updates)
    }
    setEditingId(null)
    setShowEditColorPicker(false)
  }

  return (
    <Dialog open={open} onClose={onClose} title="Manage labels">
      <div className="space-y-4">
        {/* Existing labels */}
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {labels.map((label) => (
            <div key={label.id}>
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 group">
                <button
                  onClick={() => {
                    if (editingId === label.id) {
                      setShowEditColorPicker(!showEditColorPicker)
                    } else {
                      setEditingId(label.id)
                      setEditName(label.name)
                      setEditColor(label.color)
                      setShowEditColorPicker(true)
                    }
                  }}
                  className="w-5 h-5 rounded-full shrink-0 border-2 border-white shadow-sm hover:scale-110 transition-transform"
                  style={{ backgroundColor: editingId === label.id && editColor ? editColor : label.color }}
                />
                {editingId === label.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdate(label.id)
                      if (e.key === 'Escape') { setEditingId(null); setShowEditColorPicker(false) }
                    }}
                    className="flex-1 text-sm outline-none bg-transparent border-b border-gray-300 py-0.5"
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 text-sm text-gray-700">{label.name}</span>
                )}
                {editingId === label.id ? (
                  <button
                    onClick={() => handleUpdate(label.id)}
                    className="p-1 rounded text-green-500 hover:bg-green-50"
                  >
                    <Check size={14} />
                  </button>
                ) : (
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingId(label.id)
                        setEditName(label.name)
                        setEditColor(label.color)
                      }}
                      className="p-1 rounded text-gray-400 hover:text-gray-600"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteLabel(label.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              {/* Edit color picker */}
              {editingId === label.id && showEditColorPicker && (
                <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                  {PROJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setEditColor(c.value)}
                      className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all hover:scale-110',
                        editColor === c.value ? 'border-gray-800 scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
          {labels.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No labels yet. Create one below.</p>
          )}
        </div>

        {/* Add new label */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <button
              className="w-6 h-6 rounded-full shrink-0 border-2 border-white shadow-sm hover:scale-110 transition-transform"
              style={{ backgroundColor: newColor }}
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Pick color"
            />
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
              }}
              placeholder="Label name"
              className="flex-1 text-sm outline-none bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-gray-400"
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim()}
              className="text-sm bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 font-medium"
            >
              Add
            </button>
          </div>

          {/* Color picker grid */}
          {showColorPicker && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setNewColor(c.value)
                    setShowColorPicker(false)
                  }}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all hover:scale-110',
                    newColor === c.value ? 'border-gray-800 scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}
