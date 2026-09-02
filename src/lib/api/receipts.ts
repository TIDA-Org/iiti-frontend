import { apiFetch } from './core'
import type {
  ReceiptApiResponse,
  ReceiptListApiResponse,
  ReceiptVerifyPayload,
} from '@/types/receipt'

// ── Receipt Operations ───────────────────────────────────────────────────────

/**
 * Upload a bank deposit slip for a pending payment (student action).
 * POST /api/v1/payments/receipts/upload/{payment_id}
 * Uses multipart/form-data — file must be appended to a FormData object.
 */
export async function apiUploadReceipt(
  paymentId: string,
  file: File,
): Promise<ReceiptApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/payments/receipts/upload/${paymentId}`, {
    method: 'POST',
    body: formData,
    // Content-Type is intentionally NOT set; the browser sets it with the boundary
  })
}

/**
 * Approve or reject an uploaded bank slip (staff only).
 * PUT /api/v1/payments/receipts/{receipt_id}/verify
 */
export async function apiVerifyReceipt(
  receiptId: string,
  data: ReceiptVerifyPayload,
): Promise<ReceiptApiResponse> {
  return apiFetch(`/payments/receipts/${receiptId}/verify`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Get all receipts for a specific payment.
 * GET /api/v1/payments/receipts/?payment_id=&page=&per_page=
 */
export async function apiGetReceiptsByPayment(
  paymentId: string,
  page = 1,
  perPage = 20,
): Promise<ReceiptListApiResponse> {
  return apiFetch(
    `/payments/receipts/?payment_id=${paymentId}&page=${page}&per_page=${perPage}`,
  )
}

/**
 * Get receipts with optional filters. Used by student portal to list all their receipts.
 * GET /api/v1/payments/receipts/?page=&per_page=
 */
export async function apiGetReceipts(
  page = 1,
  perPage = 100,
): Promise<ReceiptListApiResponse> {
  return apiFetch(`/payments/receipts/?page=${page}&per_page=${perPage}`)
}

/**
 * Get all pending/uploaded receipts for admin review queue.
 * GET /api/v1/payments/receipts/?status=uploaded&page=&per_page=
 */
export async function apiGetPendingReceipts(
  page = 1,
  perPage = 20,
): Promise<ReceiptListApiResponse> {
  return apiFetch(
    `/payments/receipts/?status=uploaded&page=${page}&per_page=${perPage}`,
  )
}

/**
 * Get verified (approved or rejected) receipts for admin history view.
 * GET /api/v1/payments/receipts/?status=approved&page=&per_page=
 */
export async function apiGetVerifiedReceipts(
  page = 1,
  perPage = 20,
): Promise<ReceiptListApiResponse> {
  return apiFetch(
    `/payments/receipts/?page=${page}&per_page=${perPage}`,
  )
}

/**
 * Get a short-lived pre-signed URL for securely viewing a private B2 bank slip.
 * GET /api/v1/payments/receipts/{receipt_id}/signed-url
 */
export async function apiGetReceiptSignedUrl(
  receiptId: string,
): Promise<{ signed_url: string; expires_in: number }> {
  return apiFetch(`/payments/receipts/${receiptId}/signed-url`)
}
