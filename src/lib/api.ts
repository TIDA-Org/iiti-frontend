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
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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
  batch_id: string | null
  theory_score: number | null
  practical_score: number | null
  score_percentage: number | null
  grade_type: string | null
  final_grade: string | null
  result_status: string
  remarks: string | null
  remarks_si: string | null
  is_published: boolean
  published_at: string | null
  published_by: string | null
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

// ── Verify API ────────────────────────────────

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

// ── Courses API ───────────────────────────────

export interface CourseCategoryApiResponse {
  id: number
  name: string
  name_si: string | null
  slug: string
  description: string | null
  description_si: string | null
  icon_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingLocationApiResponse {
  id: number
  name: string
  name_si: string | null
  address: string | null
  city: string | null
  district: string | null
  google_maps_url: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
  created_at: string
}

export interface CourseDurationOptionApiResponse {
  id: number
  course_id: string
  duration_value: number
  duration_unit: string
  label: string | null
  label_si: string | null
  fee_override: number | null
  is_available: boolean
}

export interface BatchApiResponse {
  id: string
  course_id: string
  location_id: number | null
  duration_option_id: number | null
  batch_code: string
  start_date: string
  end_date: string
  max_capacity: number | null
  instructor_name: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CourseApiResponse {
  id: string
  category_id: number
  course_code: string
  course_type: string
  name: string
  name_si: string | null
  short_name: string | null
  description: string | null
  description_si: string | null
  full_details: string | null
  full_details_si: string | null
  nvq_level: string | null
  is_nvq_linked: boolean
  tvec_code: string | null
  has_nvq_option: boolean
  nvq_option_extra_fee: number
  total_fee: number
  is_trial: boolean
  trial_fee: number
  allows_installment: boolean
  max_installments: number
  intake_capacity: number | null
  thumbnail_url: string | null
  gallery_urls: string[] | null
  display_order: number
  is_active: boolean
  category: CourseCategoryApiResponse | null
  duration_options: CourseDurationOptionApiResponse[]
  created_at: string
  updated_at: string
}

export interface CourseDetailApiResponse extends CourseApiResponse {
  course_locations: TrainingLocationApiResponse[]
  batches: BatchApiResponse[]
}

export async function apiGetCourseCategories(): Promise<CourseCategoryApiResponse[]> {
  return apiFetch('/courses/categories')
}

export async function apiCreateCourseCategory(data: Record<string, unknown>): Promise<CourseCategoryApiResponse> {
  return apiFetch('/courses/categories', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateCourseCategory(id: number, data: Record<string, unknown>): Promise<CourseCategoryApiResponse> {
  return apiFetch(`/courses/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiGetTrainingLocations(): Promise<TrainingLocationApiResponse[]> {
  return apiFetch('/courses/locations')
}

export async function apiCreateTrainingLocation(data: Record<string, unknown>): Promise<TrainingLocationApiResponse> {
  return apiFetch('/courses/locations', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateTrainingLocation(id: number, data: Record<string, unknown>): Promise<TrainingLocationApiResponse> {
  return apiFetch(`/courses/locations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiGetCourses(): Promise<CourseApiResponse[]> {
  return apiFetch('/courses')
}

export async function apiCreateCourse(data: Record<string, unknown>): Promise<CourseApiResponse> {
  return apiFetch('/courses', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetCourse(id: string): Promise<CourseDetailApiResponse> {
  return apiFetch(`/courses/${id}`)
}

export async function apiUpdateCourse(id: string, data: Record<string, unknown>): Promise<CourseApiResponse> {
  return apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiGetBatches(courseId?: string): Promise<BatchApiResponse[]> {
  const params = courseId ? `?course_id=${courseId}` : ''
  return apiFetch(`/courses/batches${params}`)
}

export async function apiCreateBatch(data: Record<string, unknown>): Promise<BatchApiResponse> {
  return apiFetch('/courses/batches', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateBatch(id: string, data: Record<string, unknown>): Promise<BatchApiResponse> {
  return apiFetch(`/courses/batches/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

// ── Enrollments API ───────────────────────────

export interface EnrollmentApiResponse {
  id: string
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

export async function apiGetEnrollments(): Promise<EnrollmentApiResponse[]> {
  return apiFetch('/enrollments')
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

// ── Licenses API ──────────────────────────────

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

// ── Users (Staff) API ─────────────────────────

export interface StaffApiResponse {
  id: string
  account_id: string
  full_name: string
  email: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  preferred_language: string
  role_slug: string | null
  role_name: string | null
  created_at: string
  updated_at: string
}

export interface StaffListApiResponse {
  items: StaffApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function apiGetStaffUsers(page = 1, perPage = 20): Promise<StaffListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return apiFetch(`/users?${params}`)
}

export async function apiCreateStaffUser(data: Record<string, unknown>): Promise<StaffApiResponse> {
  return apiFetch('/users', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetStaffUser(id: string): Promise<StaffApiResponse> {
  return apiFetch(`/users/${id}`)
}

export async function apiUpdateStaffUser(id: string, data: Record<string, unknown>): Promise<StaffApiResponse> {
  return apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiDeleteStaffUser(id: string): Promise<void> {
  await apiFetch(`/users/${id}`, { method: 'DELETE' })
}

// ── Roles API ─────────────────────────────────

export interface PermissionApiResponse {
  id: number
  code: string
  module: string
  action: string
  label: string
  description: string | null
  is_active: boolean
  sort_order: number
}

export interface RoleApiResponse {
  id: number
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  permissions: PermissionApiResponse[]
  created_at: string
  updated_at: string
}

export async function apiGetRoles(): Promise<RoleApiResponse[]> {
  return apiFetch('/roles')
}

export async function apiCreateRole(data: Record<string, unknown>): Promise<RoleApiResponse> {
  return apiFetch('/roles', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetPermissions(): Promise<PermissionApiResponse[]> {
  return apiFetch('/roles/permissions')
}

export async function apiGetRole(id: number): Promise<RoleApiResponse> {
  return apiFetch(`/roles/${id}`)
}

export async function apiUpdateRole(id: number, data: Record<string, unknown>): Promise<RoleApiResponse> {
  return apiFetch(`/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiDeleteRole(id: number): Promise<void> {
  await apiFetch(`/roles/${id}`, { method: 'DELETE' })
}

export async function apiSetRolePermissions(roleId: number, permissionIds: number[]): Promise<RoleApiResponse> {
  return apiFetch(`/roles/${roleId}/permissions`, { method: 'PUT', body: JSON.stringify({ permission_ids: permissionIds }) })
}

// ── Audit API ─────────────────────────────────

export interface AuditLogApiResponse {
  id: number
  actor_staff_id: string | null
  actor_student_id: string | null
  actor_role: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  old_value: unknown
  new_value: unknown
  description: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditLogListApiResponse {
  items: AuditLogApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export async function apiGetAuditLogs(
  page = 1,
  perPage = 20,
  filters?: {
    actor_staff_id?: string
    actor_student_id?: string
    action?: string
    entity_type?: string
    entity_id?: string
    date_from?: string
    date_to?: string
  },
): Promise<AuditLogListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
  }
  return apiFetch(`/audit?${params}`)
}

// ── Results (Create/Update) API ───────────────

export async function apiCreateResult(data: Record<string, unknown>): Promise<ResultApiResponse> {
  return apiFetch('/results', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateResult(id: string, data: Record<string, unknown>): Promise<ResultApiResponse> {
  return apiFetch(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

// ── Students (Portal Update, Photo, Guarantors, Documents) API ──

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

export async function apiAddGuarantors(studentId: string, guarantors: Record<string, unknown>[]): Promise<unknown> {
  return apiFetch(`/students/${studentId}/guarantors`, { method: 'POST', body: JSON.stringify(guarantors) })
}

export async function apiGetGuarantors(studentId: string): Promise<unknown> {
  return apiFetch(`/students/${studentId}/guarantors`)
}

export async function apiUploadStudentDocument(studentId: string, docType: string, file: File): Promise<unknown> {
  const formData = new FormData()
  formData.append('file', file)
  return apiFetch(`/students/${studentId}/documents?doc_type=${encodeURIComponent(docType)}`, {
    method: 'POST',
    headers: {},
    body: formData,
  })
}

export async function apiGetStudentDocuments(studentId: string): Promise<unknown> {
  return apiFetch(`/students/${studentId}/documents`)
}

export async function apiVerifyStudentDocument(studentId: string, documentId: string, data: { is_verified: boolean; notes?: string }): Promise<unknown> {
  return apiFetch(`/students/${studentId}/documents/${documentId}/verify`, { method: 'PUT', body: JSON.stringify(data) })
}

// ── Auth (Password Reset) API ─────────────────

export async function apiForgotPassword(username: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username }) })
}

export async function apiResetPassword(username: string, otp: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ username, otp, new_password: newPassword }) })
}

// ── Utility Exports ───────────────────────────

export { clearTokens, getAccessToken, setTokens }
