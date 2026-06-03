import { apiFetch } from './core'

export interface VerifyCertificateResponse {
  id: string
  student_id: string | null
  student_number: string | null
  full_name: string | null
  name_for_certificate: string | null
  nic_number: string | null
  photo_url: string | null
  certificate_id: string | null
  verification_token: string | null
  certificate_number: string
  cert_subtype: string
  status: string
  issue_date: string | null
  is_revoked: boolean
  printed_name: string | null
  printed_nic_number: string | null
  grade: string | null
  course_name: string | null
  enrollment_number: string | null
}

export interface VerifyQrStudentResponse {
  id: string
  student_number: string
  full_name: string
  name_for_certificate: string
  nic_number: string
  photo_url: string | null
}

export interface VerifyQrCertificateResponse {
  id: string
  verification_token: string
  certificate_number: string
  cert_subtype: string
  status: string
  issue_date: string | null
  is_revoked: boolean
  printed_name: string | null
  printed_nic_number: string | null
  grade: string | null
}

export interface VerifyLicenseResponse {
  id: string
  license_number: string
  vehicle_type: string
  status: string
  issue_date: string | null
  expiry_date: string | null
  is_revoked: boolean
}

export interface VerifyResultResponse {
  id: string
  final_grade: string | null
  score_percentage: number | null
  result_status: string
  is_published: boolean
  certificate_id: string | null
}

export interface VerifyApiResponse {
  student: {
    id: string
    student_number: string
    full_name: string
    name_for_certificate: string
    nic_number: string
    photo_url: string | null
  }
  certificates: VerifyCertificateResponse[]
  licenses: VerifyLicenseResponse[]
  results: VerifyResultResponse[]
}

export interface VerifyQrApiResponse {
  student: VerifyQrStudentResponse
  certificate: VerifyQrCertificateResponse
  course_name: string | null
  enrollment_number: string | null
}

export async function apiVerify(token: string): Promise<VerifyQrApiResponse> {
  return apiFetch(`/verify/${encodeURIComponent(token.trim())}`)
}

export interface VerifyManualParams {
  student_number?: string
  nic_number?: string
  certificate_number?: string
  enrollment_number?: string
  student_token?: string
}

export async function apiVerifyManual(params: VerifyManualParams): Promise<VerifyApiResponse> {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim()) {
      query.set(key, value.trim())
    }
  })

  return apiFetch(`/verify?${query.toString()}`)
}
