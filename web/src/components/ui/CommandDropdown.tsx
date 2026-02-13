'use client'

import { useEffect, useRef } from 'react'
import { Hash, Tag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Project, Label } from '@/types'

interface CommandDropdownProps {
  type: '#' | '@'
  query: string
  projects: Project[]
  labels: Label[]
  onSelectProject: (project: Project) => void
  onSelectLabel: (label: Label) => void
  onClose: () => void
  activeIndex: number
}

export default function CommandDropdown({
  type,
  query,
  projects,
  labels,
  onSelectProject,
  onSelectLabel,
  onClose,
  activeIndex,
}: CommandDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const lowerQuery = query.toLowerCase()

  const filteredProjects = type === '#'
    ? projects.filter((p) => p.name.toLowerCase().includes(lowerQuery))
    : []

  const filteredLabels = type === '@'
    ? labels.filter((l) => l.name.toLowerCase().includes(lowerQuery))
    : []

  const items = type === '#' ? filteredProjects : filteredLabels
  if (items.length === 0) return null

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-[60] min-w-[200px] max-h-[200px] overflow-y-auto"
    >
      <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {type === '#' ? 'Projects' : 'Labels'}
      </div>
      {type === '#' &&
        filteredProjects.map((project, i) => (
          <button
            key={project.id}
            onClick={() => onSelectProject(project)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
              i === activeIndex && 'bg-gray-50'
            )}
          >
            <Hash size={14} style={{ color: project.color }} />
            <span className="truncate">{project.name}</span>
          </button>
        ))}
      {type === '@' &&
        filteredLabels.map((label, i) => (
          <button
            key={label.id}
            onClick={() => onSelectLabel(label)}
            className={cn(
              'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors',
              i === activeIndex && 'bg-gray-50'
            )}
          >
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            <span className="truncate">{label.name}</span>
          </button>
        ))}
    </div>
  )
}
