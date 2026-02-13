'use client'

import { LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import DropdownMenu, { DropdownItem } from '@/components/ui/DropdownMenu'

export default function UserMenu() {
  const { profile, signOut } = useAuthStore()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() || 'U'

  return (
    <DropdownMenu
      align="right"
      trigger={
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200 transition-colors">
          {initials}
        </button>
      }
    >
      <div className="px-3 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{profile?.full_name || 'User'}</p>
        <p className="text-xs text-gray-500">{profile?.email}</p>
      </div>
      <DropdownItem onClick={() => router.push('/settings')}>
        <Settings size={16} />
        Settings
      </DropdownItem>
      <DropdownItem onClick={handleSignOut} danger>
        <LogOut size={16} />
        Log out
      </DropdownItem>
    </DropdownMenu>
  )
}
