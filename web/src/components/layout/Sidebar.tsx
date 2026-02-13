'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  CalendarDays,
  Inbox,
  Plus,
  ChevronDown,
  ChevronRight,
  Hash,
  Tag,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import ProjectCreateDialog from '@/components/projects/ProjectCreateDialog'
import LabelManageDialog from '@/components/labels/LabelManageDialog'

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { projects } = useProjectStore()
  const [projectsExpanded, setProjectsExpanded] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showLabels, setShowLabels] = useState(false)

  const inboxProject = projects.find((p) => p.is_inbox)
  const userProjects = projects.filter((p) => !p.is_inbox)

  const navItems = [
    { href: '/today', label: 'Today', icon: Calendar },
    { href: '/upcoming', label: 'Upcoming', icon: CalendarDays },
    ...(inboxProject
      ? [{ href: '/inbox', label: 'Inbox', icon: Inbox }]
      : []),
  ]

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed md:relative z-50 md:z-auto flex flex-col h-full bg-[#fcfaf8] border-r border-gray-200 transition-all duration-200',
          sidebarOpen ? 'w-[280px] translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <Link href="/today" className="text-lg font-bold text-gray-900">
            Doer
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {/* Main nav items */}
          <div className="space-y-0.5 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) setSidebarOpen(false)
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Projects section */}
          <div>
            <div className="flex items-center justify-between px-3 py-2">
              <button
                onClick={() => setProjectsExpanded(!projectsExpanded)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
              >
                {projectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Projects
              </button>
              <button
                onClick={() => setShowCreateProject(true)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Plus size={16} />
              </button>
            </div>

            {projectsExpanded && (
              <div className="space-y-0.5">
                {userProjects.map((project) => {
                  const isActive = pathname === `/project/${project.id}`
                  return (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      onClick={() => {
                        if (window.innerWidth < 768) setSidebarOpen(false)
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-red-50 text-red-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      <Hash size={16} style={{ color: project.color }} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="mt-4">
            <button
              onClick={() => setShowLabels(true)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 w-full transition-colors"
            >
              <Tag size={16} />
              Labels
            </button>
          </div>
        </nav>
      </aside>

      <ProjectCreateDialog
        open={showCreateProject}
        onClose={() => setShowCreateProject(false)}
      />
      <LabelManageDialog
        open={showLabels}
        onClose={() => setShowLabels(false)}
      />
    </>
  )
}
