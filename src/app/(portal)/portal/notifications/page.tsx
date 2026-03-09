'use client'

import { useStudentPortalStore } from '@/store/studentPortalStore'
import { formatDate } from '@/lib/utils'
import { Bell, BellOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PortalNotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useStudentPortalStore()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Notifications</h1>
          <p className="text-stone-500 text-sm mt-1">{notifications.filter(n => !n.isRead).length} unread</p>
        </div>
        <button
          onClick={markAllAsRead}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-200 hover:border-orange-300 px-4 py-2 rounded-lg transition-colors"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {notifications.map(notif => (
              <button
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={cn('w-full text-left flex items-start gap-4 px-6 py-4 hover:bg-stone-50 transition-colors', !notif.isRead && 'bg-orange-50')}
              >
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', {
                  'bg-green-100': notif.type === 'success',
                  'bg-blue-100': notif.type === 'info',
                  'bg-yellow-100': notif.type === 'warning',
                  'bg-red-100': notif.type === 'error',
                })}>
                  <Bell className={cn('w-4 h-4', {
                    'text-green-500': notif.type === 'success',
                    'text-blue-500': notif.type === 'info',
                    'text-yellow-500': notif.type === 'warning',
                    'text-red-500': notif.type === 'error',
                  })} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', notif.isRead ? 'text-stone-500' : 'text-stone-800')}>{notif.title}</p>
                  <p className="text-sm text-stone-400 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-stone-300 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
                {!notif.isRead && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0 mt-1.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
