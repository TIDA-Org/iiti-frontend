// ── Receipt Types — matches backend ReceiptResponse schema ───────────────────

export type ReceiptStatus = 'uploaded' | 'approved' | 'rejected'

export interface ReceiptApiResponse {
  id: string
  payment_id: string
  student_id: string
  file_url: string
  original_name: string | null
  file_size_kb: number | null
  uploaded_via: string
  bank_reference_no: string | null
  transfer_date: string | null
  amount_on_slip: number | null
  status: ReceiptStatus
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  uploaded_at: string
  // Enriched from payment join
  receipt_number: string | null
  enrollment_number: string | null
}

export interface ReceiptListApiResponse {
  items: ReceiptApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ReceiptVerifyPayload {
  is_approved: boolean
  bank_reference_no?: string
  rejection_reason?: string
}
