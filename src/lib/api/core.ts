const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('iiti-access-token')
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('iiti-refresh-token')
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('iiti-access-token', accessToken)
  localStorage.setItem('iiti-refresh-token', refreshToken)
}

export function clearTokens() {
  localStorage.removeItem('iiti-access-token')
  localStorage.removeItem('iiti-refresh-token')
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

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  }

  const accessToken = getAccessToken()
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  let res = await fetch(url, { ...options, headers })

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

  if (res.status === 204) return {} as T

  return res.json()
}
