import { apiFetch } from './core'

export interface EnrollmentApiResponse {
  id: string
  enrollment_number: string
  student_id: string
  course_id: string
  batch_id: string | null
  duration_option_id: number | null
  payment_plan: string
  nvq_selected: boolean
  custom_fee: number | null
  notes: string | null
  enrollment_date: string
  enrollment_status: string
  total_fee_at_enrollment: number
  amount_paid: number
  is_retake: boolean
  retake_of: string | null
  created_at: string
  updated_at: string
}

export interface EnrollmentDetailApiResponse extends EnrollmentApiResponse {
  fee_breakdown: Record<string, unknown> | null
}

export async function apiCreateEnrollment(data: Record<string, unknown>): Promise<EnrollmentApiResponse> {
  return apiFetch('/enrollments', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetEnrollments(studentId?: string): Promise<EnrollmentApiResponse[]> {
  const params = studentId ? `?student_id=${encodeURIComponent(studentId)}` : ''
  return apiFetch(`/enrollments${params}`)
}

export async function apiGetMyEnrollments(): Promise<EnrollmentApiResponse[]> {
  return apiFetch('/enrollments/me')
}

export async function apiGetEnrollment(id: string): Promise<EnrollmentDetailApiResponse> {
  return apiFetch(`/enrollments/${id}`)
}

export async function apiUpdateEnrollmentStatus(id: string, status: string): Promise<EnrollmentApiResponse> {
  return apiFetch(`/enrollments/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}

export async function apiCreateRetake(enrollmentId: string, data: Record<string, unknown>): Promise<EnrollmentApiResponse> {
  return apiFetch(`/enrollments/${enrollmentId}/retake`, { method: 'POST', body: JSON.stringify(data) })
}
