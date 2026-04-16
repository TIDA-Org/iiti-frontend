import { apiFetch } from './core'

export interface JobVacancyApiResponse {
  id: string
  title: string
  title_si: string | null
  company_name: string
  description: string
  description_si: string | null
  location: string | null
  salary_range: string | null
  required_course_ids: string[] | null
  vacancy_status: 'draft' | 'active' | 'closed' | string
  application_deadline: string | null
  is_published: boolean
  published_at: string | null
  posted_by: string | null
  application_count: number
  created_at: string
  updated_at: string
}

export interface JobVacancyListApiResponse {
  items: JobVacancyApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface JobApplicationApiResponse {
  id: string
  vacancy_id: string
  student_id: string
  status: 'pending' | 'reviewed' | 'forwarded' | 'rejected' | string
  student_message: string | null
  staff_notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  applied_at: string
  vacancy_title: string | null
  student_name: string | null
  student_number: string | null
}

export interface JobApplicationListApiResponse {
  items: JobApplicationApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface JobVacancyPayload {
  title: string
  title_si?: string | null
  company_name: string
  description: string
  description_si?: string | null
  location?: string | null
  salary_range?: string | null
  required_course_ids?: string[] | null
  application_deadline?: string | null
  is_published?: boolean
  vacancy_status?: string | null
}

export interface JobApplicationPayload {
  student_message?: string | null
}

export interface JobApplicationStatusPayload {
  status: string
  staff_notes?: string | null
}

export async function apiGetPublishedVacancies(): Promise<JobVacancyApiResponse[]> {
  return apiFetch('/jobs/')
}

export async function apiGetAdminVacancies(
  page = 1,
  perPage = 20,
  status?: string,
): Promise<JobVacancyListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (status && status !== 'all') {
    params.set('status', status)
  }
  return apiFetch(`/jobs/admin?${params}`)
}

export async function apiCreateVacancy(data: JobVacancyPayload): Promise<JobVacancyApiResponse> {
  return apiFetch('/jobs/', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetVacancy(id: string): Promise<JobVacancyApiResponse> {
  return apiFetch(`/jobs/${id}`)
}

export async function apiUpdateVacancy(id: string, data: Partial<JobVacancyPayload>): Promise<JobVacancyApiResponse> {
  return apiFetch(`/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiPublishVacancy(id: string): Promise<JobVacancyApiResponse> {
  return apiFetch(`/jobs/${id}/publish`, { method: 'PUT' })
}

export async function apiCloseVacancy(id: string): Promise<JobVacancyApiResponse> {
  return apiFetch(`/jobs/${id}/close`, { method: 'PUT' })
}

export async function apiApplyToVacancy(id: string, data: JobApplicationPayload): Promise<JobApplicationApiResponse> {
  return apiFetch(`/jobs/${id}/apply`, { method: 'POST', body: JSON.stringify(data) })
}

export async function apiGetMyApplications(): Promise<JobApplicationApiResponse[]> {
  return apiFetch('/jobs/applications/mine')
}

export async function apiGetAdminApplications(
  page = 1,
  perPage = 20,
  vacancyId?: string,
  status?: string,
): Promise<JobApplicationListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (vacancyId && vacancyId !== 'all') {
    params.set('vacancy_id', vacancyId)
  }
  if (status && status !== 'all') {
    params.set('status', status)
  }
  return apiFetch(`/jobs/applications?${params}`)
}

export async function apiUpdateApplicationStatus(
  id: string,
  data: JobApplicationStatusPayload,
): Promise<JobApplicationApiResponse> {
  return apiFetch(`/jobs/applications/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}