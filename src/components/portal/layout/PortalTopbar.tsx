'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { NotificationDropdown } from '@/components/shared/NotificationDropdown'
import { Menu, ShoppingCart } from 'lucide-react'
import { useState, useEffect } from 'react'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { LanguageSwitcher } from '@/components/portal/layout/LanguageSwitcher'

interface PortalTopbarProps {
  onToggleSidebar: () => void
}

export function PortalTopbar({ onToggleSidebar }: PortalTopbarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('merch_cart')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const total = Object.values(parsed).reduce((sum: number, item: any) => sum + item.quantity, 0)
          setCartCount(total)
        } catch (e) {
          setCartCount(0)
        }
      } else {
        setCartCount(0)
      }
    }

    updateCartCount()
    const interval = setInterval(updateCartCount, 1000)
    return () => clearInterval(interval)
  }, [])

  const getLocalizedTitle = () => {
    if (pathname.includes('/portal/dashboard')) return t.nav.dashboard
    if (pathname.includes('/portal/courses/')) return t.courses.courseDetails
    if (pathname.includes('/portal/courses')) return t.nav.courses
    if (pathname.includes('/portal/payments')) return t.nav.payments
    if (pathname.includes('/portal/results')) return t.nav.results
    if (pathname.includes('/portal/certificates')) return t.nav.certificates
    if (pathname.includes('/portal/profile')) return t.nav.profile
    if (pathname.includes('/portal/jobs')) return t.nav.jobs
    if (pathname.includes('/portal/merchandise/orders')) return t.nav.orders
    if (pathname.includes('/portal/merchandise/cart')) return t.merchandise.cart
    if (pathname.includes('/portal/merchandise')) return t.nav.merchandise
    if (pathname.includes('/portal/feedback/history')) return t.feedback.historyTitle
    if (pathname.includes('/portal/feedback')) return t.nav.feedback
    if (pathname.includes('/portal/notifications')) return t.nav.notifications
    
    const parts = pathname.split('/').filter(Boolean)
    return parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || t.nav.portalTitle
  }

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen)
    onToggleSidebar()
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 md:px-6 gap-3 md:gap-4 shrink-0">
      {/* Hamburger button for mobile */}
      {isMobile && (
        <button
          onClick={handleToggle}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
          aria-label={t.nav.menu}
        >
          <Menu className="w-5 h-5 text-slate-600" />
        </button>
      )}

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-slate-800 truncate">{getLocalizedTitle()}</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Language Switcher */}
        <LanguageSwitcher compact={isMobile} />

        {/* Cart Link */}
        <Link
          href="/portal/merchandise/cart"
          className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title={t.nav.cartTooltip}
        >
          <ShoppingCart className="w-5 h-5 text-slate-600" />
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>

        <NotificationDropdown />
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-700">{user?.name}</div>
          <div className="text-xs text-slate-400">{user?.studentId}</div>
        </div>
      </div>
    </header>
  )
}
