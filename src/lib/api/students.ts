import { apiFetch } from './core'

export interface GuarantorApiResponse {
  id: number
  student_id: string
  guarantor_order: number
  full_name: string
  phone: string | null
  relationship_to: string | null
}

export interface StudentDocumentApiResponse {
  id: string
  student_id: string
  doc_type: string
  file_url: string | null
  original_name: string | null
  is_verified: boolean
  verified_by: string | null
  verified_at: string | null
  uploaded_at: string
  notes: string | null
}

export interface StudentApiResponse {
  id: string
  account_id: string | null
  student_number: string
  enrollment_date: string
  full_name: string
  name_for_certificate: string
  nic_number: string
  date_of_birth: string
  gender: string
  address_line1: string
  address_line2: string | null
  city: string
  district: string
  province: string
  phone_primary: string
  phone_secondary: string | null
  email: string | null
  photo_url: string | null
  is_doing_nvq: boolean
  has_previous_nvq: boolean
  nvq_eligible: boolean
  tvec_ref_number: string | null
  qr_code_token: string
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_rel: string | null
  preferred_language: string
  is_legacy: boolean
  legacy_student_id: string | null
  whatsapp_in_group: boolean
  guarantors: GuarantorApiResponse[]
  documents: StudentDocumentApiResponse[]
  created_at: string
  updated_at: string
}

export interface StudentListApiResponse {
  items: StudentApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface StudentSelfRegisterRequest {
  full_name: string
  name_for_certificate: string
  nic_number: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  address_line1: string
  city: string
  district: string
  province: string
  phone_primary: string
  address_line2?: string | null
  phone_secondary?: string | null
  email?: string | null
  preferred_language?: 'en' | 'si'
  is_doing_nvq?: boolean
  has_previous_nvq?: boolean
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_rel?: string | null
}

export async function apiGetStudents(
  page = 1,
  perPage = 20,
  search?: string,
): Promise<StudentListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  return apiFetch(`/students?${params}`)
}

export async function apiGetStudent(id: string): Promise<StudentApiResponse> {
  return apiFetch(`/students/${id}`)
}

export async function apiGetMyProfile(): Promise<StudentApiResponse> {
  return apiFetch('/students/me')
}

export async function apiCreateStudent(data: Record<string, unknown>): Promise<StudentApiResponse> {
  return apiFetch('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiSelfRegisterStudent(data: StudentSelfRegisterRequest): Promise<StudentApiResponse> {
  return apiFetch('/students/self-register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function apiUpdateStudent(id: string, data: Record<string, unknown>): Promise<StudentApiResponse> {
  return apiFetch(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiDeleteStudent(id: string): Promise<void> {
  await apiFetch(`/students/${id}`, { method: 'DELETE' })
}

export async function apiUpdateMyProfile(data: Record<string, unknown>): Promise<StudentApiResponse> {
  return apiFetch('/students/me', { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiUploadStudentPhoto(studentId: string, file: File): Promise<StudentApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/students/${studentId}/photo`, {
    method: 'POST',
    headers: {},
    body: formData,
  })
}

export async function apiAddGuarantors(studentId: string, guarantors: Record<string, unknown>[]): Promise<GuarantorApiResponse[]> {
  return apiFetch(`/students/${studentId}/guarantors`, { method: 'POST', body: JSON.stringify(guarantors) })
}

export async function apiGetGuarantors(studentId: string): Promise<GuarantorApiResponse[]> {
  return apiFetch(`/students/${studentId}/guarantors`)
}

export async function apiUploadStudentDocument(studentId: string, docType: string, file: File): Promise<StudentDocumentApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/students/${studentId}/documents?doc_type=${encodeURIComponent(docType)}`, {
    method: 'POST',
    headers: {},
    body: formData,
  })
}

export async function apiGetStudentDocuments(studentId: string): Promise<StudentDocumentApiResponse[]> {
  return apiFetch(`/students/${studentId}/documents`)
}

export async function apiVerifyStudentDocument(studentId: string, documentId: string, data: { is_verified: boolean; notes?: string }): Promise<StudentDocumentApiResponse> {
  return apiFetch(`/students/${studentId}/documents/${documentId}/verify`, { method: 'PUT', body: JSON.stringify(data) })
}
