'use client'

import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { NotificationDropdown } from '@/components/shared/NotificationDropdown'

export function PortalTopbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const parts = pathname.split('/').filter(Boolean)
  const currentPage = parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Portal'

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h2 className="text-base font-semibold text-stone-700">{currentPage}</h2>
      </div>
      <div className="flex items-center gap-3">
        <NotificationDropdown />
        <div className="text-right">
          <div className="text-sm font-medium text-stone-700">{user?.name}</div>
          <div className="text-xs text-stone-400">{user?.studentId}</div>
        </div>
      </div>
    </header>
  )
}
