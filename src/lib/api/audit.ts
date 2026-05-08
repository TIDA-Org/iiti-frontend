import { apiFetch } from './core'

export interface AuditLogApiResponse {
  id: number
  actor_staff_id: string | null
  actor_student_id: string | null
  actor_email: string | null
  actor_name: string | null
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

export interface AuditActionOption {
  value: string
  label: string
}

export async function apiGetAuditLogs(
  page = 1,
  perPage = 20,
  filters?: {
    actor_email?: string
    action?: string
    entity_type?: string
    date?: string
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

export async function apiGetAuditActions(): Promise<AuditActionOption[]> {
  return apiFetch('/audit/actions')
}
