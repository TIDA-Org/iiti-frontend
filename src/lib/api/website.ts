import { apiFetch } from './core'

export interface AnnouncementApiResponse {
  id: string
  title: string
  title_si: string | null
  body: string | null
  body_si: string | null
  announcement_type: string
  image_url: string | null
  link_url: string | null
  display_order: number
  is_published: boolean
  published_at: string | null
  expires_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AnnouncementListApiResponse {
  items: AnnouncementApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface TestimonialApiResponse {
  id: string
  source: string
  reviewer_name: string
  reviewer_avatar: string | null
  rating: number
  review_text: string
  review_text_si: string | null
  google_review_id: string | null
  google_review_url: string | null
  review_date: string | null
  is_published: boolean
  display_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface TestimonialListApiResponse {
  items: TestimonialApiResponse[]
  total: number
  page: number
  per_page: number
  pages: number
}

export interface ContentSectionApiResponse {
  id: string
  section: string
  title: string | null
  title_si: string | null
  content: string | null
  content_si: string | null
  meta_description: string | null
  is_published: boolean
  published_at: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export async function apiGetPublicAnnouncements(): Promise<AnnouncementApiResponse[]> {
  return apiFetch('/website/announcements')
}

export async function apiGetAdminAnnouncements(
  page = 1,
  perPage = 20,
  announcementType?: string,
): Promise<AnnouncementListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (announcementType) params.set('announcement_type', announcementType)
  return apiFetch(`/website/announcements/admin?${params}`)
}

export async function apiCreateAnnouncement(data: Record<string, unknown>): Promise<AnnouncementApiResponse> {
  return apiFetch('/website/announcements', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateAnnouncement(id: string, data: Record<string, unknown>): Promise<AnnouncementApiResponse> {
  return apiFetch(`/website/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiDeleteAnnouncement(id: string): Promise<{ message: string }> {
  return apiFetch(`/website/announcements/${id}`, { method: 'DELETE' })
}

export async function apiGetPublicTestimonials(): Promise<TestimonialApiResponse[]> {
  return apiFetch('/website/testimonials')
}

export async function apiGetAdminTestimonials(
  page = 1,
  perPage = 20,
  source?: string,
): Promise<TestimonialListApiResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (source) params.set('source', source)
  return apiFetch(`/website/testimonials/admin?${params}`)
}

export async function apiCreateTestimonial(data: Record<string, unknown>): Promise<TestimonialApiResponse> {
  return apiFetch('/website/testimonials', { method: 'POST', body: JSON.stringify(data) })
}

export async function apiUpdateTestimonial(id: string, data: Record<string, unknown>): Promise<TestimonialApiResponse> {
  return apiFetch(`/website/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function apiDeleteTestimonial(id: string): Promise<{ message: string }> {
  return apiFetch(`/website/testimonials/${id}`, { method: 'DELETE' })
}

export async function apiGetContentSections(): Promise<ContentSectionApiResponse[]> {
  return apiFetch('/website/content')
}

export async function apiGetContentSection(section: string): Promise<ContentSectionApiResponse> {
  return apiFetch(`/website/content/${section}`)
}

export async function apiUpdateContentSection(section: string, data: Record<string, unknown>): Promise<ContentSectionApiResponse> {
  return apiFetch(`/website/content/${section}`, { method: 'PUT', body: JSON.stringify(data) })
}