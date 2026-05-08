import { useCallback, useEffect, useState } from 'react'
import { apiGetAuditLogs, AuditLogListApiResponse } from '@/lib/api/audit'
import { ApiError } from '@/lib/api/core'

export interface AuditLogsFilters {
  actor_email?: string
  action?: string
  entity_type?: string
  date?: string
  date_from?: string
  date_to?: string
}

interface UseAuditLogsState {
  data: AuditLogListApiResponse | null
  isLoading: boolean
  error: string | null
  isForbidden: boolean
}

/**
 * Hook for fetching and managing audit logs with pagination and filters.
 * Super Admin only.
 */
export function useAuditLogs(page: number = 1, perPage: number = 50, filters?: AuditLogsFilters) {
  const [state, setState] = useState<UseAuditLogsState>({
    data: null,
    isLoading: true,
    error: null,
    isForbidden: false,
  })

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null, isForbidden: false }))
    try {
      const response = await apiGetAuditLogs(page, perPage, filters)
      setState((prev) => ({ ...prev, data: response, isLoading: false }))
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setState((prev) => ({ ...prev, isForbidden: true, isLoading: false }))
      } else {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load audit logs'
        setState((prev) => ({ ...prev, error: errorMsg, isLoading: false }))
      }
    }
  }, [page, perPage, filters])

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    ...state,
    refetch: fetch,
  }
}
