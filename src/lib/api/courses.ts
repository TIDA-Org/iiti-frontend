import { apiFetch } from './core'

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
