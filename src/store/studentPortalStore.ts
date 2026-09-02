import { create } from 'zustand'
import { NotificationApiResponse } from '@/types/notification'
import { apiGetStudentNotifications, apiUpdateNotificationStatus } from '@/lib/api/notifications'
import { apiGetMyProfile } from '@/lib/api/students'

interface StudentPortalState {
  notifications: NotificationApiResponse[]
  unreadCount: number
  isLoadingNotifications: boolean
  notificationsLoaded: boolean

  loadNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export const useStudentPortalStore = create<StudentPortalState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoadingNotifications: false,
  notificationsLoaded: false,

  loadNotifications: async () => {
    if (get().isLoadingNotifications) return
    set({ isLoadingNotifications: true })
    try {
      const profile = await apiGetMyProfile()
      const data = await apiGetStudentNotifications(profile.id)
      const notifs = Array.isArray(data) ? data : []
      set({
        notifications: notifs,
        unreadCount: notifs.filter(n => n.status !== 'read').length,
        notificationsLoaded: true,
      })
    } catch {
      // Silently fail — don't break the portal layout
    } finally {
      set({ isLoadingNotifications: false })
    }
  },

  markAsRead: async (id: string) => {
    const existing = get().notifications.find(n => n.id === id)
    if (!existing || existing.status === 'read') return
    try {
      const updated = await apiUpdateNotificationStatus(id, { status: 'read' })
      set((state) => {
        const updated_notifs = state.notifications.map(n => n.id === updated.id ? updated : n)
        return {
          notifications: updated_notifs,
          unreadCount: updated_notifs.filter(n => n.status !== 'read').length,
        }
      })
    } catch {
      // optimistic fallback
      set((state) => {
        const updated_notifs = state.notifications.map(n =>
          n.id === id ? { ...n, status: 'read' as const } : n
        )
        return {
          notifications: updated_notifs,
          unreadCount: updated_notifs.filter(n => n.status !== 'read').length,
        }
      })
    }
  },

  markAllAsRead: async () => {
    const unread = get().notifications.filter(n => n.status !== 'read')
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, status: 'read' as const })),
      unreadCount: 0,
    }))
    // Persist each to backend
    await Promise.allSettled(
      unread.map(n => apiUpdateNotificationStatus(n.id, { status: 'read' }))
    )
  },
}))
