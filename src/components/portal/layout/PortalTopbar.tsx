'use client'

import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { NotificationDropdown } from '@/components/shared/NotificationDropdown'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PortalTopbarProps {
  onToggleSidebar: () => void
}

export function PortalTopbar({ onToggleSidebar }: PortalTopbarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const parts = pathname.split('/').filter(Boolean)
  const currentPage = parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Portal'

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen)
    onToggleSidebar()
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 flex-shrink-0">
      {/* Hamburger button for mobile */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-slate-700 truncate">{currentPage}</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3 ml-auto">
        <NotificationDropdown />
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-700">{user?.name}</div>
          <div className="text-xs text-slate-400">{user?.studentId}</div>
        </div>
      </div>
    </header>
  )
}
