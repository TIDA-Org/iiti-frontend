export const CLIENT_API_BASE_URL = '/api/backend'
const DEFAULT_TIMEOUT_MS = 5000
const MAX_IDEMPOTENT_RETRIES = 0
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504])
const ENABLE_MOCK_DATA = process.env.NODE_ENV === 'development'

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
  public status: number
  public code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.message = message
    
    // Properly set prototype for instanceof checks and proper inheritance chain
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, new.target.prototype)
    } else {
      (this as any).__proto__ = ApiError.prototype
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      status: this.status,
      code: this.code,
      message: this.message,
    }
  }
}

function getMockData(path: string): unknown {
  // Mock data for common endpoints
  const mockResponses: Record<string, unknown> = {
    '/settings/public': [],
    '/courses/': [
      {
        id: 'course-1',
        name: 'Forklift Operations',
        course_code: 'FORK-001',
        description: 'NVQ Level 3 certified forklift operator training',
        display_order: 1,
        is_active: true,
      },
      {
        id: 'course-2',
        name: 'Excavator Operations',
        course_code: 'EXC-001',
        description: 'Advanced heavy machinery operation training',
        display_order: 2,
        is_active: true,
      },
    ],
    '/website/stats': [
      { key: 'years_of_excellence', label: 'Years of Excellence', label_si: null, value: 10, suffix: '+' },
      { key: 'total_students', label: 'Students Trained', label_si: null, value: 500, suffix: '+' },
      { key: 'total_courses', label: 'Courses Offered', label_si: null, value: 3, suffix: '' },
    ],
    '/website/content/other': {
      id: 'other',
      section: 'other',
      title: 'Why Choose Us',
      title_si: null,
      content: 'Industry-leading training with certified instructors',
      content_si: null,
      meta_description: null,
      is_published: true,
      published_at: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    '/website/announcements': [],
    '/website/testimonials': [],
    '/website/certificates': {
      eyebrow: 'Certifications',
      eyebrow_si: null,
      title: 'Industry-Recognized Certifications',
      title_highlight: null,
      title_si: null,
      title_highlight_si: null,
      description: 'All our courses lead to NVQ Level 3 certification',
      description_si: null,
      verify_button_label: 'Verify Certificate',
      verify_button_label_si: null,
      items: [
        {
          key: 'nvq-level-3',
          title: 'NVQ Level 3',
          title_si: null,
          description: 'National Vocational Qualification Level 3',
          description_si: null,
        },
      ],
    },
    '/website/jobs-teaser': {
      eyebrow: 'Career Opportunities',
      eyebrow_si: null,
      title: 'Job Portal',
      title_highlight: null,
      title_si: null,
      title_highlight_si: null,
      description: 'Find job opportunities in your field',
      description_si: null,
      cta_label: 'Explore Jobs',
      cta_label_si: null,
      cta_href: '/jobs',
      metrics: [],
    },
  }

  return mockResponses[path] || []
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

      // In development, return mock data on network errors
      if (ENABLE_MOCK_DATA && method === 'GET') {
        console.warn(`[API] Using mock data for ${path} (backend unavailable)`)
        return getMockData(path) as T
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
