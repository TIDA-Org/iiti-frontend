'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminTopbar } from '@/components/admin/layout/AdminTopbar'
import { PageLoader } from '@/components/shared/PageLoader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated, hydrateUser } = useAuthStore()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (_hasHydrated) hydrateUser()
  }, [_hasHydrated, hydrateUser])

  useEffect(() => {
    if (!_hasHydrated) return
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }
    if (user.role === 'student') {
      router.replace('/portal/dashboard')
    }
  }, [_hasHydrated, isAuthenticated, user, router])

  if (!_hasHydrated || !isAuthenticated || !user || user.role === 'student') {
    return <PageLoader />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <AdminSidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 bg-slate-900/35 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
