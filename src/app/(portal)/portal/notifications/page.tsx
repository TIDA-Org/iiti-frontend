'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStudentPortalStore } from '@/store/studentPortalStore'
import { NotificationApiResponse } from '@/types/notification'
import { Bell, BellOff, MessageSquare, Mail, Zap, CheckCheck, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function channelIcon(channel: string) {
  switch (channel) {
    case 'sms': return <MessageSquare className="w-4 h-4" />
    case 'email': return <Mail className="w-4 h-4" />
    default: return <Zap className="w-4 h-4" />
  }
}

function channelBg(channel: string) {
  switch (channel) {
    case 'sms': return 'bg-blue-100 text-blue-600'
    case 'email': return 'bg-purple-100 text-purple-600'
    default: return 'bg-slate-100 text-slate-600'
  }
}

function statusDot(status: string) {
  switch (status) {
    case 'sent': return 'bg-green-500'
    case 'failed': return 'bg-red-500'
    case 'pending': return 'bg-amber-400'
    case 'read': return 'bg-emerald-400'
    default: return 'bg-slate-300'
  }
}

function statusLabel(status: string) {
  return { sent: 'Delivered', failed: 'Failed', pending: 'Pending', read: 'Read' }[status] ?? status
}

import { useTranslation } from '@/lib/i18n/useTranslation'

function NotificationCard({ notif, onClose }: { notif: NotificationApiResponse; onClose: () => void }) {
  const { t } = useTranslation()

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', channelBg(notif.channel))}>
              {channelIcon(notif.channel)}
            </div>
            <span className="font-semibold text-sm text-stone-800">System Notification</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-1 text-stone-400 hover:text-stone-600 cursor-pointer rounded-md hover:bg-stone-100 transition-colors"
            aria-label={t.common.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {notif.subject && (
            <h2 className="font-bold text-lg text-stone-800 mb-2">{notif.subject}</h2>
          )}
          <p className="text-stone-600 whitespace-pre-wrap">{notif.message}</p>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <span className={cn('w-2 h-2 rounded-full inline-block', statusDot(notif.status))} />
              {statusLabel(notif.status)}
            </span>
            <span className="text-xs text-stone-300">{formatDate(notif.created_at)}</span>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-stone-100">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notifications Page ─────────────────────────────────────────────────────────

export default function PortalNotificationsPage() {
  const { t } = useTranslation()
  const {
    notifications,
    isLoadingNotifications,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useStudentPortalStore()

  const router = useRouter()
  const searchParams = useSearchParams()
  const highlightId = searchParams.get('highlight')

  const [selectedNotif, setSelectedNotif] = useState<NotificationApiResponse | null>(null)
  const highlightRef = useRef<HTMLButtonElement | null>(null)
  const handledHighlightRef = useRef<string | null>(null)

  // Refresh notifications once when the notification view/cards are rendered on mount
  useEffect(() => {
    loadNotifications(true)
  }, [loadNotifications])

  // Filter defensively to only system notifications
  const systemNotifications = notifications.filter(n => n.channel === 'system')
  const systemUnreadCount = systemNotifications.filter(n => n.status !== 'read').length

  // Auto-open the highlighted notification (from bell click)
  useEffect(() => {
    if (!highlightId) {
      handledHighlightRef.current = null
      return
    }

    // If this highlightId has already been opened or dismissed, don't re-trigger
    if (handledHighlightRef.current === highlightId) return

    if (systemNotifications.length > 0) {
      const notif = systemNotifications.find(n => n.id === highlightId)
      if (notif) {
        handledHighlightRef.current = highlightId
        setSelectedNotif(notif)
        // Mark as read automatically when opened from bell
        if (notif.status !== 'read') {
          markAsRead(notif.id)
        }
        // Scroll to it
        setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
      }
    }
  }, [highlightId, systemNotifications, markAsRead])

  const handleOpen = async (notif: NotificationApiResponse) => {
    setSelectedNotif(notif)
    if (notif.status !== 'read') {
      await markAsRead(notif.id)
    }
  }

  const handleCloseModal = () => {
    // Immediately mark as handled so the highlight effect does not re-open the modal
    if (highlightId) {
      handledHighlightRef.current = highlightId
      router.replace('/portal/notifications', { scroll: false })
    }
    setSelectedNotif(null)
  }

  return (
    <div>
      {selectedNotif && (
        <NotificationCard notif={selectedNotif} onClose={handleCloseModal} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {t.notifications.title}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {isLoadingNotifications ? t.common.loading : `${systemUnreadCount} ${t.common.statusUnread} · ${systemNotifications.length} ${t.common.all}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadNotifications(true)}
            disabled={isLoadingNotifications}
            className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-800 font-medium border border-stone-200 hover:border-stone-300 px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw className={cn('w-4 h-4', isLoadingNotifications && 'animate-spin')} />
            <span>Refresh</span>
          </button>
          {systemUnreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-medium border border-orange-200 hover:border-orange-300 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              {t.notifications.markAllRead}
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {isLoadingNotifications && systemNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-stone-400 text-sm gap-2">
            <Bell className="w-5 h-5 animate-pulse" />
            {t.common.loading}
          </div>
        ) : systemNotifications.length === 0 ? (
          <div className="text-center py-12">
            <BellOff className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-400 text-sm">{t.notifications.emptyDesc}</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-50">
            {systemNotifications.map(notif => (
              <button
                key={notif.id}
                ref={notif.id === highlightId ? highlightRef : null}
                onClick={() => handleOpen(notif)}
                className={cn(
                  'w-full text-left flex items-start gap-4 px-6 py-4 hover:bg-stone-50 transition-colors',
                  notif.status !== 'read' && 'bg-orange-50',
                  notif.id === highlightId && 'ring-2 ring-orange-400 ring-inset',
                )}
              >
                {/* Channel Icon */}
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5', channelBg(notif.channel))}>
                  {channelIcon(notif.channel)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {notif.subject && (
                    <p className={cn('text-sm font-semibold', notif.status !== 'read' ? 'text-stone-800' : 'text-stone-500')}>
                      {notif.subject}
                    </p>
                  )}
                  <p className="text-sm text-stone-600 mt-0.5 line-clamp-2">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-stone-300">{formatDate(notif.created_at)}</p>
                    <span className="flex items-center gap-1 text-xs text-stone-400">
                      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', statusDot(notif.status))} />
                      {statusLabel(notif.status)}
                    </span>
                    <span className="text-xs text-stone-400">System</span>
                  </div>
                </div>

                {/* Unread dot */}
                {notif.status !== 'read' && (
                  <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
