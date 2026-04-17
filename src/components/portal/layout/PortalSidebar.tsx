'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, CreditCard, FileText,
  Award, Briefcase, Bell, LogOut, GraduationCap, X, ShoppingCart, PackageCheck,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useStudentPortalStore } from '@/store/studentPortalStore'

const NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/courses', label: 'My Courses', icon: BookOpen },
  { href: '/portal/payments', label: 'Payments', icon: CreditCard },
  { href: '/portal/results', label: 'Results', icon: FileText },
  { href: '/portal/certificates', label: 'Certificates', icon: Award },
  { href: '/portal/jobs', label: 'Job Board', icon: Briefcase },
  { href: '/portal/merchandise/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/portal/merchandise/orders', label: 'My Orders', icon: PackageCheck },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell },
]

interface PortalSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
  collapsed: boolean
  onToggleCollapse: () => void
}

export function PortalSidebar({
  isOpen,
  onClose,
  isMobile,
  collapsed,
  onToggleCollapse,
}: PortalSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useStudentPortalStore()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      setLogoutDialogOpen(false)
      if (isMobile) {
        onClose()
      }
      router.push('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const handleNavClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  return (
    <aside
      className={cn(
        'fixed md:static inset-y-0 left-0 z-40 md:z-auto flex flex-col h-full bg-white border-r border-slate-200 shrink-0',
        'transition-transform duration-300 ease-in-out md:transition-all',
        isMobile ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64') : 'translate-x-0',
        !isMobile && (collapsed ? 'w-24' : 'w-72')
      )}
    >
      {isMobile && (
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100 shrink-0 md:hidden">
          <span className="font-semibold text-slate-700">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg" aria-label="Close sidebar">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      )}

      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-100 transition-all duration-300 shrink-0',
        !isMobile && collapsed ? 'justify-between px-3' : 'gap-2.5 px-5'
      )}>
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex-1 min-w-0">
            <div className="text-slate-800 font-bold text-sm truncate">IITI Portal</div>
            <div className="text-slate-400 text-xs">Student</div>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:inline-flex text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-1 hover:bg-slate-100 rounded"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="py-4 px-3 shrink-0">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  title={!isMobile && collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center rounded-lg text-sm transition-all duration-150',
                    !isMobile && collapsed ? 'justify-center mx-auto w-12 h-12 px-0' : 'gap-3 px-3 py-2.5',
                    active
                      ? (!isMobile && collapsed
                        ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                        : 'bg-orange-50 text-orange-600 font-semibold border-l-2 border-orange-500')
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active && 'text-orange-500')} />
                  {(!collapsed || isMobile) && <span className="flex-1">{item.label}</span>}
                  {item.href === '/portal/notifications' && unreadCount > 0 && (!collapsed || isMobile) && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1"></div>

      {/* User footer */}
      <div className="border-t border-slate-100 p-4 shrink-0">
        <div className={cn('flex items-center gap-3', !isMobile && collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-orange-600 text-sm font-bold">{user ? getInitials(user.name) : 'S'}</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 text-sm font-medium truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{user?.studentId}</div>
            </div>
          )}
          <button
            onClick={() => setLogoutDialogOpen(true)}
            title="Sign Out"
            className={cn(
              'text-slate-400 hover:text-red-500 transition-colors shrink-0',
              !isMobile && collapsed ? 'p-1.5 rounded-lg hover:bg-red-50' : 'p-1'
            )}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleLogout}
        loading={loggingOut}
        portalLabel="Student Portal"
      />
    </aside>
  )
}
