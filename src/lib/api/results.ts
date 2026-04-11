import { apiFetch } from './core'

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

export async function apiCreateResult(data: Record<string, unknown>): Promise<ResultApiResponse> {
  return apiFetch('/results', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateResult(id: string, data: Record<string, unknown>): Promise<ResultApiResponse> {
  return apiFetch(`/results/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}
