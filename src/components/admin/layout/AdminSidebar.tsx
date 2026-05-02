'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, CreditCard,
  FileText, Award, Briefcase, Tag, Calendar, BarChart3,
  UserCog, Database, Shield, Settings, ChevronLeft, ChevronRight, ChevronDown,
  LogOut, MapPin, Layers, ReceiptText, BriefcaseBusiness,
  Package, ShoppingBag, Megaphone, MessageSquareQuote, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiGetRoles } from '@/lib/api/roles'
import { LogoutConfirmDialog } from '@/components/shared/LogoutConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles?: string[]
  permission?: string
  children?: NavItem[]
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
      {
        href: '/admin/courses',
        label: 'Courses',
        icon: BookOpen,
        roles: ['super_admin', 'admin', 'front_desk'],
        children: [
          { href: '/admin/courses', label: 'Courses', icon: BookOpen, roles: ['super_admin', 'admin', 'front_desk'] },
          { href: '/admin/courses/categories', label: 'Course Categories', icon: Tag, roles: ['super_admin', 'admin'] },
          { href: '/admin/courses/locations', label: 'Course Locations', icon: MapPin, roles: ['super_admin', 'admin'] },
        ],
      },
      { href: '/admin/batches', label: 'Batches', icon: Layers, roles: ['super_admin', 'admin', 'front_desk'] },
      { href: '/admin/intakes', label: 'Intake Dates', icon: Calendar, roles: ['super_admin', 'admin', 'front_desk'] },
      {
        href: '/admin/results',
        label: 'Results',
        icon: FileText,
        roles: ['super_admin', 'admin', 'front_desk'],
        children: [
          { href: '/admin/results', label: 'Results', icon: FileText, roles: ['super_admin', 'admin', 'front_desk'] },
          { href: '/admin/results/enter', label: 'Result Entry', icon: ClipboardList, roles: ['super_admin', 'admin', 'front_desk'] },
        ],
      },
      {
        href: '/admin/certificates',
        label: 'Certificates',
        icon: Award,
        roles: ['super_admin', 'admin', 'front_desk'],
        children: [
          { href: '/admin/certificates', label: 'Certificates', icon: Award, roles: ['super_admin', 'admin', 'front_desk'] },
          { href: '/admin/certificates/nvq', label: 'NVQ Certificates', icon: Award, roles: ['super_admin', 'admin'] },
          { href: '/admin/certificates/licenses', label: 'License Certificates', icon: Award, roles: ['super_admin', 'admin'] },
        ],
      },
    ],
  },
  {
    label: 'Finance',
    items: [
      {
        href: '/admin/payments',
        label: 'Payments',
        icon: CreditCard,
        roles: ['super_admin', 'admin'],
        children: [
          { href: '/admin/payments', label: 'Payments', icon: CreditCard, roles: ['super_admin', 'admin'] },
          { href: '/admin/payments/receipts', label: 'Receipts', icon: ReceiptText, roles: ['super_admin', 'admin', 'front_desk'] },
        ],
      },
      { href: '/admin/reports', label: 'Reports', icon: BarChart3, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    label: 'Recruitment',
    items: [
      {
        href: '/admin/vacancies',
        label: 'Jobs',
        icon: Briefcase,
        roles: ['super_admin', 'admin', 'front_desk'],
        children: [
          { href: '/admin/vacancies', label: 'Job Vacancies', icon: Briefcase, roles: ['super_admin', 'admin', 'front_desk'] },
          { href: '/admin/jobs/applications', label: 'Applications', icon: BriefcaseBusiness, roles: ['super_admin', 'admin', 'front_desk'] },
          { href: '/admin/offers', label: 'Offers', icon: Tag, roles: ['super_admin', 'admin', 'front_desk'] },
        ],
      },
    ],
  },
  {
    label: 'Commerce',
    items: [
      {
        href: '/admin/merchandise/items',
        label: 'Merchandise',
        icon: Package,
        roles: ['super_admin', 'admin'],
        children: [
          { href: '/admin/merchandise/items', label: 'Items', icon: Package, roles: ['super_admin', 'admin'] },
          { href: '/admin/merchandise/orders', label: 'Orders', icon: ShoppingBag, roles: ['super_admin', 'admin'] },
        ],
      },
    ],
  },
  {
    label: 'Website',
    items: [
      {
        href: '/admin/website/announcements',
        label: 'Content',
        icon: Megaphone,
        roles: ['super_admin', 'admin'],
        children: [
          { href: '/admin/website/announcements', label: 'Announcements', icon: Megaphone, roles: ['super_admin', 'admin'] },
          { href: '/admin/website/testimonials', label: 'Testimonials', icon: MessageSquareQuote, roles: ['super_admin', 'admin'] },
        ],
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/users', label: 'Users', icon: UserCog, roles: ['super_admin', 'admin'] },
      { href: '/admin/roles', label: 'Roles', icon: UserCog, roles: ['super_admin'] },
      { href: '/admin/migration', label: 'Data Migration', icon: Database, roles: ['super_admin'] },
      { href: '/admin/audit-logs', label: 'Audit Logs', icon: Shield, roles: ['super_admin'], permission: 'audit.view' },
      {
        href: '/admin/settings',
        label: 'Settings',
        icon: Settings,
        roles: ['super_admin'],
        children: [
          { href: '/admin/settings', label: 'Settings', icon: Settings, roles: ['super_admin'] },
          { href: '/admin/settings/sms-templates', label: 'SMS Templates', icon: MessageSquare, roles: ['super_admin'] },
        ],
      },
    ],
  },
]

export function AdminSidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const router = useRouter()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [permissionCodes, setPermissionCodes] = useState<Set<string> | null>(null)
  const [permissionRevision, setPermissionRevision] = useState(0)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}

    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (!item.children || item.children.length === 0) return
        const parentActive = pathname === item.href || pathname.startsWith(item.href + '/')
        const childActive = item.children.some(
          (child) => pathname === child.href || pathname.startsWith(child.href + '/'),
        )
        initial[item.href] = parentActive || childActive
      })
    })

    return initial
  })

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      setLogoutDialogOpen(false)
      onCloseMobile()
      router.push('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  const closeMobileIfNeeded = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onCloseMobile()
    }
  }

  useEffect(() => {
    let cancelled = false

    const loadRolePermissions = async () => {
      if (!user || user.role === 'student') {
        if (!cancelled) setPermissionCodes(null)
        return
      }

      try {
        const roles = await apiGetRoles()
        const currentRole = roles.find((r) => r.slug === user.role)
        const codes = new Set((currentRole?.permissions || []).map((p) => p.code))
        if (!cancelled) setPermissionCodes(codes)
      } catch {
        // Fallback to role-only visibility when permission query isn't available
        if (!cancelled) setPermissionCodes(null)
      }
    }

    loadRolePermissions()

    return () => {
      cancelled = true
    }
  }, [permissionRevision, user])

  useEffect(() => {
    const onPermissionsUpdated = () => setPermissionRevision((v) => v + 1)
    window.addEventListener('rbac-updated', onPermissionsUpdated)
    return () => window.removeEventListener('rbac-updated', onPermissionsUpdated)
  }, [])

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => ({ ...prev, [href]: !prev[href] }))
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const canAccess = useMemo(() => {
    return (item: NavItem) => {
      const roleAllowed = !item.roles || (user && item.roles.includes(user.role))
      if (!roleAllowed) return false

      if (!item.permission) return true
      if (!permissionCodes) return true

      return permissionCodes.has(item.permission)
    }
  }, [permissionCodes, user])

  return (
    <aside
      className={cn(
        'fixed md:static inset-y-0 left-0 z-50 md:z-auto',
        'bg-white border-r border-slate-200 flex flex-col h-full shrink-0',
        'transition-transform duration-300 ease-in-out md:transition-all',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        sidebarCollapsed ? 'w-24' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-100 transition-all duration-300',
        sidebarCollapsed ? 'justify-between px-3' : 'gap-3 px-4'
      )}>
        <Link
          href="/"
          onClick={closeMobileIfNeeded}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 overflow-hidden"
          aria-label="Go to landing page"
        >
          <Image
            src="/assets/logo_v2.png"
            alt="IITI Logo"
            width={32}
            height={32}
            className="h-full w-full object-contain"
          />
        </Link>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="text-slate-900 font-bold text-sm truncate" style={{ fontFamily: 'Inter, sans-serif' }}>IITI Admin</div>
            <div className="text-slate-500 text-xs truncate">Management Portal</div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="hidden md:inline-flex text-slate-400 hover:text-slate-700 transition-colors shrink-0 p-1 hover:bg-slate-100 rounded"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => canAccess(item))
          if (visibleItems.length === 0) return null

          return (
            <div key={group.label} className={cn(sidebarCollapsed ? 'mb-2' : 'mb-6')}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {group.label}
                </div>
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)

                  const visibleChildren = (item.children || []).filter((child) => canAccess(child))

                  const hasChildren = visibleChildren.length > 0 && !sidebarCollapsed
                  const activeChildHref = visibleChildren
                    .filter((child) => isActive(child.href))
                    .sort((a, b) => b.href.length - a.href.length)[0]?.href
                  const isChildrenActive = Boolean(activeChildHref)
                  const menuOpen = Boolean(openMenus[item.href])

                  if (hasChildren) {
                    return (
                      <li key={item.href}>
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.href)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                            isChildrenActive
                              ? 'bg-orange-50 text-orange-700 border-l-2 border-orange-500 font-medium'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                          )}
                        >
                          <Icon className={cn('shrink-0 w-4 h-4', isChildrenActive && 'text-orange-500')} />
                          <span className="truncate flex-1 text-left">{item.label}</span>
                          <ChevronDown className={cn('w-4 h-4 transition-transform', menuOpen && 'rotate-180')} />
                        </button>

                        {menuOpen && (
                          <ul className="mt-1 ml-6 space-y-0.5 border-l border-slate-200 pl-2">
                            {visibleChildren.map((child) => {
                              const ChildIcon = child.icon
                              const childActive = activeChildHref === child.href
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    className={cn(
                                      'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150',
                                      childActive
                                        ? 'bg-orange-50 text-orange-700 font-medium'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    )}
                                    onClick={closeMobileIfNeeded}
                                  >
                                    <ChildIcon className={cn('shrink-0 w-3.5 h-3.5', childActive && 'text-orange-500')} />
                                    <span className="truncate">{child.label}</span>
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  }

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg text-sm transition-all duration-150',
                          sidebarCollapsed ? 'justify-center mx-auto w-12 h-12 px-0' : 'px-3 py-2',
                          active
                            ? (sidebarCollapsed
                              ? 'bg-orange-50 text-orange-700 ring-1 ring-orange-200'
                              : 'bg-orange-50 text-orange-700 border-l-2 border-orange-500 font-medium')
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                        )}
                        title={sidebarCollapsed ? item.label : undefined}
                        onClick={closeMobileIfNeeded}
                      >
                        <Icon className={cn('shrink-0 w-4 h-4', active && 'text-orange-500')} />
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
      <div className="border-t border-slate-100 p-4">
        <div className={cn('flex items-center gap-3', sidebarCollapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
            <span className="text-orange-700 text-xs font-bold">{user ? getInitials(user.name) : 'U'}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-slate-900 text-sm font-semibold truncate">{user?.name}</div>
              <div className="text-slate-500 text-xs capitalize">{user?.role?.replace('_', ' ')}</div>
            </div>
          )}
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
            title="Logout"
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
        portalLabel="Admin Portal"
      />
    </aside>
  )
}
