'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminTopbar } from '@/components/admin/layout/AdminTopbar'
import { PageLoader } from '@/components/shared/PageLoader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role === 'student') {
      router.replace('/portal/dashboard')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role === 'student') {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
