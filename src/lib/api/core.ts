export const CLIENT_API_BASE_URL = '/api/backend'
const DEFAULT_TIMEOUT_MS = 15000
const MAX_IDEMPOTENT_RETRIES = 2
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

function getApiBaseUrl() {
  if (typeof window === 'undefined') {
    const configured = process.env.API_BASE_URL?.trim()
    if (configured) {
      return normalizeBaseUrl(configured)
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error('API_BASE_URL environment variable is required in production')
    }

    return 'http://localhost:8000/api/v1'
  }
  return CLIENT_API_BASE_URL
}

function isIdempotentMethod(method: string) {
  return method === 'GET' || method === 'HEAD' || method === 'OPTIONS'
}

function shouldRetryStatus(status: number) {
  return RETRYABLE_STATUS_CODES.has(status)
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  const upstreamSignal = init.signal
  if (upstreamSignal) {
    if (upstreamSignal.aborted) {
      controller.abort()
    } else {
      upstreamSignal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
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
  const method = (options.method || 'GET').toUpperCase()
  const shouldRetry = isIdempotentMethod(method)

  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...((options.headers as Record<string, string>) || {}),
  }

  let res: Response | null = null
  let attempt = 0
  const maxRetries = shouldRetry ? MAX_IDEMPOTENT_RETRIES : 0

  while (attempt <= maxRetries) {
    try {
      res = await fetchWithTimeout(
        url,
        {
          ...options,
          headers,
          cache: options.cache ?? 'no-store',
          credentials: typeof window !== 'undefined' ? 'include' : undefined,
        },
        DEFAULT_TIMEOUT_MS,
      )
    } catch (error) {
      const isAbortError = error instanceof DOMException && error.name === 'AbortError'
      const canRetry = shouldRetry && attempt < maxRetries

      if (canRetry) {
        await sleep(200 * (attempt + 1))
        attempt += 1
        continue
      }

      if (isAbortError) {
        throw new ApiError(504, 'request_timeout', 'Request timed out. Please try again.')
      }

      throw new ApiError(503, 'network_error', 'Unable to reach the server. Please try again.')
    }

    if (res.ok || !shouldRetry || !shouldRetryStatus(res.status) || attempt >= maxRetries) {
      break
    }

    await sleep(200 * (attempt + 1))
    attempt += 1
  }

  if (!res) {
    throw new ApiError(500, 'unknown_error', 'Request failed unexpectedly')
  }

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

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return res.json() as Promise<T>
  }

  return (await res.text()) as T
}
