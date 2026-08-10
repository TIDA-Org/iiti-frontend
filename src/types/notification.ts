// ── Notification Types — matches backend NotificationResponse schema ─────────

export type NotificationChannel = 'sms' | 'email' | 'system'

export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read'

export interface NotificationApiResponse {
  id: string
  student_id: string | null
  channel: NotificationChannel
  recipient_phone: string | null
  recipient_email: string | null
  subject: string | null
  message: string
  payment_id: string | null
  enrollment_id: string | null
  status: NotificationStatus
  failed_reason: string | null
  created_at: string
  sent_at: string | null
}

export interface NotificationListApiResponse {
  items: NotificationApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface NotificationUpdatePayload {
  status: NotificationStatus
  failed_reason?: string
  sent_at?: string
}
