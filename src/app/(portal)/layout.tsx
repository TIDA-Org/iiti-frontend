'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { PortalSidebar } from '@/components/portal/layout/PortalSidebar'
import { PortalTopbar } from '@/components/portal/layout/PortalTopbar'
import { PageLoader } from '@/components/shared/PageLoader'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role !== 'student') {
      router.replace('/admin/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'student') {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <PortalTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
