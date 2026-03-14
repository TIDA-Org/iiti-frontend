'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, CreditCard,
  FileText, Award, Briefcase, Tag, Calendar, BarChart3,
  UserCog, Database, Shield, Settings, ChevronLeft, ChevronRight,
  LogOut, GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: string[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'admin', 'front_desk'] },
    ],
  },
  {
    label: 'Students',
    items: [
      { href: '/admin/students', label: 'All Students', icon: Users, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/enrollments', label: 'Enrollments', icon: ClipboardList, roles: ['super_admin', 'admin', 'front_desk'] },
    ],
  },
  {
    label: 'Academics',
    items: [
      { href: '/admin/courses', label: 'Courses', icon: BookOpen, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/intakes', label: 'Intake Dates', icon: Calendar, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/results', label: 'Results', icon: FileText, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/certificates', label: 'Certificates', icon: Award, roles: ['super_admin', 'admin', 'front_desk'] },
    ],
  },
  {
    label: 'Finance',
    items: [
      { href: '/admin/payments', label: 'Payments', icon: CreditCard, roles: ['super_admin', 'admin'] },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      { href: '/admin/vacancies', label: 'Job Vacancies', icon: Briefcase, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/offers', label: 'Offers', icon: Tag, roles: ['super_admin', 'admin', 'front_desk'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/users', label: 'Users', icon: UserCog, roles: ['super_admin', 'admin'] },
      { href: '/admin/migration', label: 'Data Migration', icon: Database, roles: ['super_admin'] },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['super_admin'] },
      { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 flex-shrink-0',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
      style={{ backgroundColor: '#0F172A' }}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-700/50 transition-all duration-300',
        sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-4'
      )}>
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-white font-bold text-sm truncate" style={{ fontFamily: 'Inter, sans-serif' }}>IITI Admin</div>
            <div className="text-slate-400 text-xs truncate">Management Portal</div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'text-slate-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-slate-700/30 rounded',
            sidebarCollapsed ? 'absolute right-1 top-1' : ''
          )}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(item =>
            !item.roles || (user && item.roles.includes(user.role))
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className="mb-6">
              {!sidebarCollapsed && (
                <div className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                          active
                            ? 'bg-slate-800 text-white border-l-2 border-amber-500'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <Icon className={cn('flex-shrink-0', sidebarCollapsed ? 'w-5 h-5' : 'w-4 h-4', active && 'text-amber-400')} />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-700/50 p-3">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-amber-400 text-xs font-bold">{user ? getInitials(user.name) : 'U'}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{user?.name}</div>
              <div className="text-slate-400 text-xs capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
