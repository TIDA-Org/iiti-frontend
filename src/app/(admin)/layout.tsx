'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { AdminSidebar } from '@/components/admin/layout/AdminSidebar'
import { AdminTopbar } from '@/components/admin/layout/AdminTopbar'
import { PageLoader } from '@/components/shared/PageLoader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, _hasHydrated, hydrateUser } = useAuthStore()
  const { theme } = useUIStore()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    if (!_hasHydrated) return

    let cancelled = false
    ;(async () => {
      try {
        await hydrateUser()
      } finally {
        if (!cancelled) setIsCheckingSession(false)
      }
    })()

    return () => {
      cancelled = true
    }
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

  useEffect(() => {
    if (theme !== 'system') {
      setResolvedTheme(theme)
      return
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const applySystemTheme = () => setResolvedTheme(media.matches ? 'dark' : 'light')

    applySystemTheme()
    media.addEventListener('change', applySystemTheme)
    return () => media.removeEventListener('change', applySystemTheme)
  }, [theme])

  if (!_hasHydrated || isCheckingSession || !isAuthenticated || !user || user.role === 'student') {
    return <PageLoader />
  }

  return (
    <div className={`admin-theme ${resolvedTheme === 'dark' ? 'admin-theme-dark' : 'admin-theme-light'} flex h-screen overflow-hidden bg-slate-50`}>
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
