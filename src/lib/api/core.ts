const CLIENT_API_BASE_URL = '/api/backend'

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    return normalizeBaseUrl(process.env.API_BASE_URL || 'http://localhost:8000/api/v1')
  }
  return CLIENT_API_BASE_URL
}

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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: typeof window !== 'undefined' ? 'include' : undefined,
  })

  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login'
    throw new ApiError(401, 'session_expired', 'Session expired. Please log in again.')
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

  if (res.status === 204) return {} as T

  return res.json()
}
