import { apiFetch } from './core'

export interface VerifyCertificateResponse {
  id: string
  certificate_number: string
  cert_subtype: string
  status: string
  issue_date: string | null
  is_revoked: boolean
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

export async function apiVerify(token: string): Promise<VerifyApiResponse> {
  return apiFetch(`/verify/${token}`)
}
