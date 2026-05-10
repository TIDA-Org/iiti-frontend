import { apiFetch } from './core'

// ── ENROLLMENT REPORT ────────────────────────────────────────────

export interface EnrollmentStatsApiResponse {
  total_enrollments: number
  new_enrollments: number
  withdrawn: number
  completed: number
  active: number
  on_hold: number
  expelled: number
  payment_overdue: number
}

export interface EnrollmentReportRowApiResponse {
  course_code: string
  course_title: string
  batch_title: string
  batch_id: string | null
  period: string
  stats: EnrollmentStatsApiResponse
}

export interface EnrollmentReportApiResponse {
  report_type: string
  start_date: string
  end_date: string
  total_rows: number
  generated_at: string
  rows: EnrollmentReportRowApiResponse[]
}

export async function apiGetEnrollmentReport(
  reportType: string = 'monthly',
  startDate?: string,
  endDate?: string,
  courseId?: string,
  batchId?: string,
): Promise<EnrollmentReportApiResponse> {
  const params = new URLSearchParams({ report_type: reportType })
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  if (courseId) params.set('course_id', courseId)
  if (batchId) params.set('batch_id', batchId)
  return apiFetch(`/reports/enrollments?${params}`)
}

// ── PAYMENT REPORT ───────────────────────────────────────────────

export interface PaymentStatsApiResponse {
  total_collected: number
  total_pending: number
  total_overdue: number
  payment_count: number
  pending_count: number
  average_payment: number
}

export interface PaymentMethodBreakdownApiResponse {
  method: string
  count: number
  amount: number
  percentage: number
}

export interface PaymentReportRowApiResponse {
  course_code: string
  course_title: string
  period: string
  stats: PaymentStatsApiResponse
  payment_methods: PaymentMethodBreakdownApiResponse[]
}

export interface PaymentReportApiResponse {
  start_date: string
  end_date: string
  total_rows: number
  summary: PaymentStatsApiResponse
  payment_methods_summary: PaymentMethodBreakdownApiResponse[]
  generated_at: string
  rows: PaymentReportRowApiResponse[]
}

export async function apiGetPaymentReport(
  startDate?: string,
  endDate?: string,
  courseId?: string,
  paymentMethod?: string,
): Promise<PaymentReportApiResponse> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  if (courseId) params.set('course_id', courseId)
  if (paymentMethod) params.set('payment_method', paymentMethod)
  return apiFetch(`/reports/payments?${params}`)
}

// ── COMPLETION REPORT ────────────────────────────────────────────

export interface GradeDistributionApiResponse {
  grade: string
  count: number
  percentage: number
}

export interface CompletionStatsApiResponse {
  total_completions: number
  total_eligible: number
  completion_rate: number
  pass_rate: number
  fail_rate: number
  average_grade: string
}

export interface CompletionReportRowApiResponse {
  course_code: string
  course_title: string
  batch_title: string
  batch_id: string | null
  period: string
  stats: CompletionStatsApiResponse
  grade_distribution: GradeDistributionApiResponse[]
}

export interface CompletionReportApiResponse {
  start_date: string
  end_date: string
  total_rows: number
  generated_at: string
  rows: CompletionReportRowApiResponse[]
}

export async function apiGetCompletionReport(
  startDate?: string,
  endDate?: string,
  courseId?: string,
  batchId?: string,
): Promise<CompletionReportApiResponse> {
  const params = new URLSearchParams()
  if (startDate) params.set('start_date', startDate)
  if (endDate) params.set('end_date', endDate)
  if (courseId) params.set('course_id', courseId)
  if (batchId) params.set('batch_id', batchId)
  return apiFetch(`/reports/completions?${params}`)
}
