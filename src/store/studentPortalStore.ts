import { create } from 'zustand'
import { Notification } from '@/types/notification'
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data/notifications'

interface StudentPortalState {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export const useStudentPortalStore = create<StudentPortalState>((set) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,

  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      )
      return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length }
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
}))
