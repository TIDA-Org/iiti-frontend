'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { PortalSidebar } from '@/components/portal/layout/PortalSidebar'
import { PortalTopbar } from '@/components/portal/layout/PortalTopbar'
import { PageLoader } from '@/components/shared/PageLoader'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'student') {
      router.replace('/admin/dashboard')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  if (!isAuthenticated || !user || user.role !== 'student') {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <PortalSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isMobile={isMobile} />
      
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PortalTopbar onToggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
