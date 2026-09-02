import { apiFetch } from './core'
import type {
  PaymentApiResponse,
  PaymentListApiResponse,
  PaymentCreatePayload,
  PaymentUpdatePayload,
  ManualPaymentCreatePayload,
  InstallmentBreakdownApiResponse,
} from '@/types/payment'

// ── Core Payment Operations ──────────────────────────────────────────────────

/**
 * Create a new payment record (bank transfer intent).
 * POST /api/v1/payments/
 */
export async function apiCreatePayment(
  data: PaymentCreatePayload,
): Promise<PaymentApiResponse> {
  return apiFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * List all payments (admin view, paginated).
 * GET /api/v1/payments/?page=&per_page=
 */
export async function apiGetPayments(
  page = 1,
  perPage = 20,
): Promise<PaymentListApiResponse> {
  return apiFetch(`/payments/?page=${page}&per_page=${perPage}`)
}

/**
 * Get a single payment by ID.
 * GET /api/v1/payments/{id}
 */
export async function apiGetPayment(id: string): Promise<PaymentApiResponse> {
  return apiFetch(`/payments/${id}`)
}

/**
 * Search for a payment by receipt number.
 * GET /api/v1/payments/?receipt_number=...
 */
export async function apiSearchPaymentByReceiptNumber(
  receiptNumber: string,
): Promise<PaymentListApiResponse> {
  return apiFetch(`/payments/?receipt_number=${encodeURIComponent(receiptNumber)}&per_page=5`)
}

/**
 * Get all payments linked to a specific enrollment.
 * GET /api/v1/payments/enrollment/{enrollment_id}
 */
export async function apiGetPaymentsForEnrollment(
  enrollmentId: string,
): Promise<PaymentApiResponse[]> {
  return apiFetch(`/payments/enrollment/${enrollmentId}`)
}

/**
 * Update a payment's status (staff only).
 * PATCH /api/v1/payments/{id}
 */
export async function apiUpdatePayment(
  id: string,
  data: PaymentUpdatePayload,
): Promise<PaymentApiResponse> {
  return apiFetch(`/payments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ── Installment Operations ───────────────────────────────────────────────────

/**
 * Get the full installment breakdown and remaining balance for an enrollment.
 * GET /api/v1/payments/{enrollment_id}/installments
 */
export async function apiGetInstallmentBreakdown(
  enrollmentId: string,
): Promise<InstallmentBreakdownApiResponse> {
  return apiFetch(`/payments/${enrollmentId}/installments`)
}

// ── Manual / Cash Payments ───────────────────────────────────────────────────

/**
 * Record a physical cash payment taken at the counter (staff only).
 * POST /api/v1/payments/manual
 */
export async function apiCreateManualPayment(
  data: ManualPaymentCreatePayload,
): Promise<PaymentApiResponse> {
  return apiFetch('/payments/manual', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
