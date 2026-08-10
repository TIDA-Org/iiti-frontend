// ── Payment Types — matches backend PaymentResponse schema ──────────────────

export type PaymentMethod = 'bank_transfer' | 'cash'

export type PaymentStatus =
  | 'pending'
  | 'under_review'
  | 'completed'
  | 'rejected'
  | 'refunded'

export interface PaymentApiResponse {
  id: string
  enrollment_id: string
  student_id: string
  installment_number: number
  total_installments: number
  amount: number
  currency: string
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  receipt_number: string
  is_manual: boolean
  bank_reference_no: string | null
  bank_name: string | null
  branch_name: string | null
  transfer_date: string | null
  due_date: string | null
  paid_at: string | null
  approved_at: string | null
  created_at: string
  // Enriched from backend join
  enrollment_number: string | null
  student_number: string | null
}

export interface PaymentListApiResponse {
  items: PaymentApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface InstallmentSchedule {
  installment_number: number
  amount_due: number
  due_date: string
  status: 'paid' | 'pending' | 'overdue'
}

export interface InstallmentBreakdownApiResponse {
  enrollment_id: string
  total_fee: number
  total_paid: number
  remaining_balance: number
  installments: InstallmentSchedule[]
}

export interface PaymentCreatePayload {
  enrollment_id: string
  student_id: string
  amount: number
  currency?: string
  payment_method?: PaymentMethod
  bank_reference_no?: string
  bank_name?: string
  branch_name?: string
  transfer_date?: string
  due_date?: string
  installment_number?: number
  total_installments?: number
  notes?: string
  is_legacy_payment?: boolean
}

export interface ManualPaymentCreatePayload {
  enrollment_id: string
  amount: number
  manual_reason: string
  notes?: string
}

export interface PaymentUpdatePayload {
  payment_status?: PaymentStatus
  is_manual?: boolean
  manual_reason?: string
  notes?: string
}
