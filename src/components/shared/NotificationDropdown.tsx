'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudentPortalStore } from '@/store/studentPortalStore'
import { formatDate } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationDropdown() {
  const {
    notifications,
    unreadCount,
    isLoadingNotifications,
    notificationsLoaded,
    loadNotifications,
    markAsRead,
  } = useStudentPortalStore()

  const router = useRouter()

  // Load notifications when component mounts (before user clicks)
  useEffect(() => {
    if (!notificationsLoaded) {
      loadNotifications()
    }
  }, [notificationsLoaded, loadNotifications])

  const recent = notifications.slice(0, 5)

  const handleNotificationClick = async (id: string) => {
    // Mark as read and navigate to the notifications page with the notification highlighted
    await markAsRead(id)
    router.push(`/portal/notifications?highlight=${id}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="relative" />}>
        {isLoadingNotifications ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <Bell className="w-5 h-5" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center px-1 font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
          <span className="font-semibold text-sm">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
            <button
              onClick={() => router.push('/portal/notifications')}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              View all →
            </button>
          </div>
        </div>

        <div className="divide-y divide-stone-50 max-h-80 overflow-y-auto">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center gap-2 text-sm text-stone-400 py-8">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading…
            </div>
          ) : recent.length === 0 ? (
            <p className="text-center text-stone-500 text-sm py-8">No notifications</p>
          ) : (
            recent.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleNotificationClick(notif.id)}
                className={`w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors ${
                  notif.status !== 'read' ? 'bg-orange-50 border-l-2 border-orange-400' : ''
                }`}
              >
                <div className="flex items-start gap-2">
                  {notif.status !== 'read' && (
                    <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${notif.status === 'read' ? 'text-stone-600' : 'text-stone-900'}`}>
                      {notif.subject ?? 'SMS Notification'}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5 truncate">{notif.message}</p>
                    <p className="text-xs text-stone-400 mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {notifications.length > 5 && (
          <div className="px-4 py-2 border-t border-stone-100 text-center">
            <button
              onClick={() => router.push('/portal/notifications')}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              See all {notifications.length} notifications →
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
