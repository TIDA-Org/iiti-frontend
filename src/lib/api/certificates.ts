import { apiFetch } from './core'

export interface CertificateApiResponse {
  id: string
  enrollment_id: string
  student_id: string
  course_id: string
  certificate_number: string
  cert_subtype: string
  status: string
  qr_code_token: string
  qr_code_image_url: string | null
  certificate_pdf_url: string | null
  printed_name: string
  printed_nic_number: string | null
  grade: string | null
  issue_date: string | null
  is_revoked: boolean
  revoked_at: string | null
  revoked_by: string | null
  revoke_reason: string | null
  issued_by: string | null
  created_at: string
  updated_at: string
}

export interface CertificateListApiResponse {
  items: CertificateApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function apiGetCertificates(page = 1, perPage = 20): Promise<CertificateListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/certificates?${params}`)
}

export async function apiGetMyCertificates(page = 1, perPage = 20): Promise<CertificateListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/certificates/me?${params}`)
}

export async function apiGenerateCertificate(enrollmentId: string): Promise<CertificateApiResponse> {
  return apiFetch('/certificates/generate', {
    method: 'POST',
    body: JSON.stringify({ enrollment_id: enrollmentId }),
  })
}

export async function apiRevokeCertificate(id: string, reason: string): Promise<CertificateApiResponse> {
  return apiFetch(`/certificates/${id}/revoke`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  })
}
