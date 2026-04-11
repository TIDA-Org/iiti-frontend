'use client'

import { usePathname } from 'next/navigation'
import { Bell, Sun, Moon, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'

function Breadcrumb() {
  const pathname = usePathname()
  const parts = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {parts.map((part, i) => {
        const isLast = i === parts.length - 1
        const label = part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-slate-300">/</span>}
            <span className={isLast ? 'text-slate-700 font-medium' : 'text-slate-400'}>
              {label}
            </span>
          </span>
        )
      })}
    </nav>
  )
}

export function AdminTopbar({ onOpenMobileMenu }: { onOpenMobileMenu: () => void }) {
  const { theme, setTheme } = useUIStore()
  const { user } = useAuthStore()

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 shrink-0">
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenMobileMenu}
        className="md:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        title="Open menu"
      >
        <Menu className="w-5 h-5" />
      </Button>
      <div className="flex-1 min-w-0">
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-slate-500"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-slate-500 relative">
          <Bell className="w-4 h-4" />
        </Button>
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <span className="text-amber-700 text-xs font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
