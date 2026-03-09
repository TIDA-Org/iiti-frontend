'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudentPortalStore } from '@/store/studentPortalStore'
import { formatDate } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useStudentPortalStore()
  const recent = notifications.slice(0, 5)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-stone-100">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="ml-2 text-xs text-orange-500">{unreadCount} new</span>
          )}
        </div>
        <div className="divide-y divide-stone-50">
          {recent.length === 0 ? (
            <p className="text-center text-stone-500 text-sm py-8">No notifications</p>
          ) : (
            recent.map((notif) => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors ${!notif.isRead ? 'bg-orange-50' : ''}`}
              >
                <p className={`text-sm font-medium ${notif.isRead ? 'text-stone-600' : 'text-stone-900'}`}>
                  {notif.title}
                </p>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{notif.message}</p>
                <p className="text-xs text-stone-400 mt-1">{formatDate(notif.createdAt)}</p>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
