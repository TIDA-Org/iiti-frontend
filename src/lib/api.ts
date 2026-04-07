// Centralized API client for backend communication
// Handles JWT token management, refresh, and request/response formatting

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// ── Token Storage ─────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('iiti-access-token')
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('iiti-refresh-token')
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('iiti-access-token', accessToken)
  localStorage.setItem('iiti-refresh-token', refreshToken)
}

function clearTokens() {
  localStorage.removeItem('iiti-access-token')
  localStorage.removeItem('iiti-refresh-token')
}

// ── API Error ─────────────────────────────────

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.status = status
    this.code = code
    this.name = 'ApiError'
  }
}

// ── Core Fetch Wrapper ────────────────────────

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!res.ok) {
      clearTokens()
      return false
    }

    const data = await res.json()
    setTokens(data.access_token, data.refresh_token)
    return true
  } catch {
    clearTokens()
    return false
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, { ...options, headers })

  // Auto-refresh on 401
  if (res.status === 401 && accessToken) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken()
    }

    const refreshed = await refreshPromise
    isRefreshing = false
    refreshPromise = null

    if (refreshed) {
      const newToken = getAccessToken()
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`
      }
      res = await fetch(url, { ...options, headers })
    } else {
      // Force logout
      clearTokens()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new ApiError(401, 'session_expired', 'Session expired. Please log in again.')
    }
  }

  if (!res.ok) {
    let errorData: { error?: { code?: string; message?: string } } = {}
    try {
      errorData = await res.json()
    } catch {
      // non-JSON error response
    }
    throw new ApiError(
      res.status,
      errorData.error?.code || 'unknown_error',
      errorData.error?.message || `Request failed with status ${res.status}`,
    )
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T

  return res.json()
}

// ── Auth API ──────────────────────────────────

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  account_type: 'student' | 'staff'
  account_id: string
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function apiLogout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch {
      // Logout should not fail silently
    }
  }
  clearTokens()
}

// ── Students API ──────────────────────────────

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

export interface StudentListApiResponse {
  items: StudentApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
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

export async function apiUpdateStudent(id: string, data: Record<string, unknown>): Promise<StudentApiResponse> {
  return apiFetch(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function apiDeleteStudent(id: string): Promise<void> {
  await apiFetch(`/students/${id}`, { method: 'DELETE' })
}

// ── Results API ───────────────────────────────

export interface ResultApiResponse {
  id: string
  enrollment_id: string
  student_id: string
  course_id: string
  theory_score: number | null
  practical_score: number | null
  final_grade: string
  is_published: boolean
  published_at: string | null
  exam_date: string | null
  remarks: string | null
  remarks_si: string | null
  created_at: string
  updated_at: string
}

export interface ResultListApiResponse {
  items: ResultApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function apiGetResults(page = 1, perPage = 20): Promise<ResultListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/results?${params}`)
}

export async function apiGetMyResults(page = 1, perPage = 20): Promise<ResultListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/results/me?${params}`)
}

export async function apiPublishResult(id: string): Promise<ResultApiResponse> {
  return apiFetch(`/results/${id}/publish`, { method: 'PUT' })
}

export async function apiUnpublishResult(id: string): Promise<ResultApiResponse> {
  return apiFetch(`/results/${id}/unpublish`, { method: 'PUT' })
}

// ── Certificates API ──────────────────────────

export interface CertificateApiResponse {
  id: string
  certificate_number: string
  enrollment_id: string
  student_id: string
  course_id: string
  subtype: string
  issue_date: string
  certificate_url: string | null
  qr_code_url: string | null
  is_revoked: boolean
  revoked_at: string | null
  revoked_reason: string | null
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

// ── Verify API ────────────────────────────────

export interface VerifyApiResponse {
  student: {
    id: string
    student_number: string
    full_name: string
    name_for_certificate: string
    nic_number: string
    photo_url: string | null
  }
  certificates: CertificateApiResponse[]
  licenses: unknown[]
  results: ResultApiResponse[]
}

export async function apiVerify(token: string): Promise<VerifyApiResponse> {
  return apiFetch(`/verify/${token}`)
}

// ── Utility Exports ───────────────────────────

export { clearTokens, getAccessToken, setTokens }
