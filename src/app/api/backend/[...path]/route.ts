import { NextRequest, NextResponse } from 'next/server'

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  applyAuthCookies,
  clearAuthCookies,
  getBackendApiBaseUrl,
  refreshWithToken,
} from '@/lib/server/auth'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const BACKEND_TIMEOUT_MS = 15000

function buildProxyHeaders(request: NextRequest, accessToken?: string) {
  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('connection')
  headers.delete('content-length')
  headers.delete('cookie')
  headers.delete('authorization')

  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  return headers
}

async function buildRequestBody(request: NextRequest) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return undefined
  }

  const body = await request.arrayBuffer()
  return body.byteLength > 0 ? body : undefined
}

async function fetchWithTimeout(target: string, init: RequestInit) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS)

  try {
    return await fetch(target, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function forwardRequest(
  request: NextRequest,
  path: string[],
  body: ArrayBuffer | undefined,
  accessToken?: string,
) {
  const target = `${getBackendApiBaseUrl()}/${path.join('/')}${request.nextUrl.search}`

  return fetchWithTimeout(target, {
    method: request.method,
    headers: buildProxyHeaders(request, accessToken),
    body,
    cache: 'no-store',
  })
}

function toNextResponse(response: Response) {
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('content-encoding')
  headers.delete('transfer-encoding')
  headers.delete('set-cookie')
  return response.arrayBuffer().then((body) => new NextResponse(body, { status: response.status, headers }))
}

function backendUnavailableResponse() {
  return NextResponse.json(
    { error: { code: 'backend_unavailable', message: 'Backend service is unavailable. Please try again.' } },
    { status: 502 },
  )
}

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const pathString = path.join('/')
  const isAuthPath = pathString === 'auth/login' || pathString === 'auth/logout' || pathString === 'auth/refresh'
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const requestBody = await buildRequestBody(request)

  let backendResponse: Response
  try {
    backendResponse = await forwardRequest(request, path, requestBody, accessToken)
  } catch {
    return backendUnavailableResponse()
  }

  const canRefresh =
    backendResponse.status === 401 &&
    !!refreshToken &&
    !isAuthPath

  if (canRefresh) {
    const refreshedTokens = await refreshWithToken(refreshToken)

    if (refreshedTokens) {
      try {
        backendResponse = await forwardRequest(request, path, requestBody, refreshedTokens.access_token)
      } catch {
        return backendUnavailableResponse()
      }
      const response = await toNextResponse(backendResponse)
      applyAuthCookies(response, refreshedTokens)
      return response
    }

    const response = await toNextResponse(backendResponse)
    clearAuthCookies(response)
    // If refresh failed but this is a public endpoint, retry once anonymously.
    // This avoids stale auth cookies breaking unauthenticated routes.
    let anonymousResponse: Response
    try {
      anonymousResponse = await forwardRequest(request, path, requestBody)
    } catch {
      return backendUnavailableResponse()
    }
    if (anonymousResponse.status !== 401) {
      const fallbackResponse = await toNextResponse(anonymousResponse)
      clearAuthCookies(fallbackResponse)
      return fallbackResponse
    }
    return response
  }

  // For public endpoints, retry once without Authorization if token-auth request failed.
  if (backendResponse.status === 401 && !!accessToken && !isAuthPath) {
    let anonymousResponse: Response
    try {
      anonymousResponse = await forwardRequest(request, path, requestBody)
    } catch {
      return backendUnavailableResponse()
    }
    if (anonymousResponse.status !== 401) {
      const response = await toNextResponse(anonymousResponse)
      clearAuthCookies(response)
      return response
    }
  }

  const response = await toNextResponse(backendResponse)
  if (backendResponse.status === 401) {
    clearAuthCookies(response)
  }
  return response
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const OPTIONS = handle
