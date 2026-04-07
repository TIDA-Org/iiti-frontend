'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, CreditCard, FileText,
  Award, Briefcase, Bell, LogOut, GraduationCap, X
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useStudentPortalStore } from '@/store/studentPortalStore'

const NAV_ITEMS = [
  { href: '/portal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/portal/courses', label: 'My Courses', icon: BookOpen },
  { href: '/portal/payments', label: 'Payments', icon: CreditCard },
  { href: '/portal/results', label: 'Results', icon: FileText },
  { href: '/portal/certificates', label: 'Certificates', icon: Award },
  { href: '/portal/jobs', label: 'Job Board', icon: Briefcase },
  { href: '/portal/notifications', label: 'Notifications', icon: Bell },
]

interface PortalSidebarProps {
  isOpen: boolean
  onClose: () => void
  isMobile: boolean
}

export function PortalSidebar({ isOpen, onClose, isMobile }: PortalSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useStudentPortalStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleNavClick = () => {
    if (isMobile) {
      onClose()
    }
  }

  const sidebarClasses = cn(
    'flex flex-col h-full bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out z-40',
    isMobile && !isOpen ? 'fixed left-0 top-0 h-screen -translate-x-full w-64' : 'w-64',
    isMobile && isOpen && 'translate-x-0',
  )

  if (isMobile && !isOpen) {
    return (
      <aside className={cn('fixed left-0 top-0 h-screen -translate-x-full w-64 bg-white flex flex-col z-40 transition-transform duration-300 ease-in-out')}>
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-slate-100 shrink-0 md:hidden">
          <span className="font-semibold text-slate-700">Menu</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Mobile nav */}
        <nav className="py-3 px-3 shrink-0">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                      active
                        ? 'bg-orange-50 text-orange-600 font-semibold border-l-2 border-orange-500'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active && 'text-orange-500')} />
                    <span className="flex-1">{item.label}</span>
                    {item.href === '/portal/notifications' && unreadCount > 0 && (
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
              <span className="text-orange-600 text-sm font-bold">{user ? getInitials(user.name) : 'S'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 text-sm font-medium truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs truncate">{user?.studentId}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs transition-colors w-full font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside className={cn(
      'hidden md:flex flex-col h-full bg-white border-r border-slate-200 w-64 shrink-0',
      isMobile && isOpen && 'fixed left-0 top-0 h-screen flex flex-col z-40 max-w-xs transition-transform duration-300 ease-in-out'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-slate-800 font-bold text-sm truncate">IITI Portal</div>
          <div className="text-slate-400 text-xs">Student</div>
        </div>
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
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    active
                      ? 'bg-orange-50 text-orange-600 font-semibold border-l-2 border-orange-500'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', active && 'text-orange-500')} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/portal/notifications' && unreadCount > 0 && (
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-orange-600 text-sm font-bold">{user ? getInitials(user.name) : 'S'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-slate-800 text-sm font-medium truncate">{user?.name}</div>
            <div className="text-slate-400 text-xs truncate">{user?.studentId}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-500 text-xs transition-colors w-full font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
