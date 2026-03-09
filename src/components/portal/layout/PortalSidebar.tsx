'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, CreditCard, FileText,
  Award, Briefcase, Bell, LogOut, GraduationCap
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

export function PortalSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useStudentPortalStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-white border-r border-stone-200 flex flex-col h-full flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-stone-100">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-stone-800 font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI Portal</div>
          <div className="text-stone-400 text-xs">Student Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                    active
                      ? 'bg-orange-50 text-orange-600 font-semibold border-l-2 border-orange-500'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                  )}
                >
                  <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-orange-500')} />
                  <span className="flex-1">{item.label}</span>
                  {item.href === '/portal/notifications' && unreadCount > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className="border-t border-stone-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <span className="text-orange-600 text-sm font-bold">{user ? getInitials(user.name) : 'S'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-stone-800 text-sm font-medium truncate">{user?.name}</div>
            <div className="text-stone-400 text-xs truncate">{user?.studentId}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-stone-400 hover:text-red-500 text-xs transition-colors w-full"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
