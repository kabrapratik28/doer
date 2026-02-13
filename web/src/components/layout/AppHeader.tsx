'use client'

import { usePathname } from 'next/navigation'
import { Menu, Plus } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useProjectStore } from '@/stores/projectStore'
import UserMenu from '@/components/layout/UserMenu'

export default function AppHeader() {
  const pathname = usePathname()
  const { toggleSidebar, openQuickAdd } = useUIStore()
  const { getProjectById } = useProjectStore()

  const getTitle = () => {
    if (pathname === '/today') return 'Today'
    if (pathname === '/upcoming') return 'Upcoming'
    if (pathname === '/inbox') return 'Inbox'
    if (pathname.startsWith('/project/')) {
      const projectId = pathname.split('/project/')[1]
      const project = getProjectById(projectId)
      return project?.name || 'Project'
    }
    if (pathname === '/settings') return 'Settings'
    return ''
  }

  return (
    <header className="flex items-center justify-between h-14 px-4 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={openQuickAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add task</span>
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
