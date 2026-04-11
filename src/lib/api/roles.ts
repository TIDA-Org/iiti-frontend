import { apiFetch } from './core'

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
