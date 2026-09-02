import { apiFetch } from './core'
import type {
  NotificationApiResponse,
  NotificationUpdatePayload,
} from '@/types/notification'

// ── Notification Operations ──────────────────────────────────────────────────

/**
 * Get the full notification / SMS history for a specific student.
 * GET /api/v1/notifications/student/{student_id}
 */
export async function apiGetStudentNotifications(
  studentId: string,
): Promise<NotificationApiResponse[]> {
  return apiFetch(`/notifications/student/${studentId}`)
}

/**
 * Get a single notification record by ID.
 * GET /api/v1/notifications/{notification_id}
 */
export async function apiGetNotification(
  notificationId: string,
): Promise<NotificationApiResponse> {
  return apiFetch(`/notifications/${notificationId}`)
}

/**
 * Update the delivery status of a notification (e.g. mark as read / sent / failed).
 * PATCH /api/v1/notifications/{notification_id}/status
 */
export async function apiUpdateNotificationStatus(
  notificationId: string,
  data: NotificationUpdatePayload,
): Promise<NotificationApiResponse> {
  return apiFetch(`/notifications/${notificationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}
