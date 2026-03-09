import { Notification } from '@/types/notification'

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 's1', title: 'Enrollment Confirmed', message: 'Your enrollment in Forklift Operator Training has been confirmed.', type: 'success', isRead: false, createdAt: '2025-01-21T00:00:00Z', link: '/portal/courses' },
  { id: 'n2', userId: 's1', title: 'Payment Received', message: 'Payment of LKR 12,000 received for installment 1.', type: 'success', isRead: false, createdAt: '2025-01-22T00:00:00Z', link: '/portal/payments' },
  { id: 'n3', userId: 's1', title: 'Payment Due Reminder', message: 'Your next payment of LKR 11,000 is due on March 15, 2025.', type: 'warning', isRead: true, createdAt: '2025-03-01T00:00:00Z', link: '/portal/payments' },
  { id: 'n4', userId: 's1', title: 'New Job Vacancy', message: 'A new forklift operator vacancy is available at Lanka Logistics Ltd.', type: 'info', isRead: false, createdAt: '2025-03-02T00:00:00Z', link: '/portal/jobs' },
]
