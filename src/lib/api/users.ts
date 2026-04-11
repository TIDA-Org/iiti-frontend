import { apiFetch } from './core'

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
