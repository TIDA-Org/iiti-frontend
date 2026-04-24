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

async function forwardRequest(
  request: NextRequest,
  path: string[],
  body: ArrayBuffer | undefined,
  accessToken?: string,
) {
  const target = `${getBackendApiBaseUrl()}/${path.join('/')}${request.nextUrl.search}`

  return fetch(target, {
    method: request.method,
    headers: buildProxyHeaders(request, accessToken),
    body,
    cache: 'no-store',
  })
}

function toNextResponse(response: Response) {
  const headers = new Headers(response.headers)
  headers.delete('content-length')
  headers.delete('set-cookie')
  return response.arrayBuffer().then((body) => new NextResponse(body, { status: response.status, headers }))
}

async function handle(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  const requestBody = await buildRequestBody(request)

  let backendResponse = await forwardRequest(request, path, requestBody, accessToken)

  const canRefresh =
    backendResponse.status === 401 &&
    !!refreshToken &&
    path.join('/') !== 'auth/login' &&
    path.join('/') !== 'auth/logout' &&
    path.join('/') !== 'auth/refresh'

  if (canRefresh) {
    const refreshedTokens = await refreshWithToken(refreshToken)

    if (refreshedTokens) {
      backendResponse = await forwardRequest(request, path, requestBody, refreshedTokens.access_token)
      const response = await toNextResponse(backendResponse)
      applyAuthCookies(response, refreshedTokens)
      return response
    }

    const response = await toNextResponse(backendResponse)
    clearAuthCookies(response)
    return response
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
