import { apiFetch } from './core'

export interface LicenseApiResponse {
  id: string
  enrollment_id: string
  student_id: string
  course_id: string
  license_number: string
  status: string
  qr_code_token: string
  qr_code_image_url: string | null
  license_pdf_url: string | null
  license_card_url: string | null
  printed_name: string
  nic_number: string
  vehicle_type: string
  photo_url: string
  issue_date: string | null
  expiry_date: string | null
  is_revoked: boolean
  revoked_at: string | null
  revoked_by: string | null
  revoke_reason: string | null
  issued_by: string | null
  created_at: string
  updated_at: string
}

export interface LicenseListApiResponse {
  items: LicenseApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function apiGenerateLicense(enrollmentId: string): Promise<LicenseApiResponse> {
  return apiFetch('/licenses/generate', { method: 'POST', body: JSON.stringify({ enrollment_id: enrollmentId }) })
}

export async function apiRevokeLicense(id: string, reason: string): Promise<LicenseApiResponse> {
  return apiFetch(`/licenses/${id}/revoke`, { method: 'PUT', body: JSON.stringify({ reason }) })
}

export async function apiGetMyLicenses(page = 1, perPage = 20): Promise<LicenseListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/licenses/me?${params}`)
}
