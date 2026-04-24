import 'server-only'

import { NextResponse } from 'next/server'

export const ACCESS_TOKEN_COOKIE = 'iiti_access_token'
export const REFRESH_TOKEN_COOKIE = 'iiti_refresh_token'

const ACCESS_TOKEN_MAX_AGE_FALLBACK = 15 * 60
const REFRESH_TOKEN_MAX_AGE_FALLBACK = 7 * 24 * 60 * 60

export interface BackendTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  account_type: 'student' | 'staff'
  account_id: string
}

export interface SessionPayload {
  account_id: string
  account_type: 'student' | 'staff'
  username: string
  role_slug?: string
  exp?: number
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

export function getBackendApiBaseUrl() {
  const configured = process.env.API_BASE_URL
  return normalizeBaseUrl(configured || 'http://localhost:8000/api/v1')
}

export function decodeJwtPayload<T>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=')
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8')) as T
  } catch {
    return null
  }
}

function getTokenMaxAge(token: string, fallbackSeconds: number) {
  const payload = decodeJwtPayload<{ exp?: number }>(token)
  if (!payload?.exp) return fallbackSeconds

  const secondsUntilExpiry = payload.exp - Math.floor(Date.now() / 1000)
  return Math.max(secondsUntilExpiry, 0)
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function applyAuthCookies(response: NextResponse, tokens: BackendTokenResponse) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    tokens.access_token,
    getCookieOptions(getTokenMaxAge(tokens.access_token, ACCESS_TOKEN_MAX_AGE_FALLBACK)),
  )
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refresh_token,
    getCookieOptions(getTokenMaxAge(tokens.refresh_token, REFRESH_TOKEN_MAX_AGE_FALLBACK)),
  )
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...getCookieOptions(0), maxAge: 0 })
  response.cookies.set(REFRESH_TOKEN_COOKIE, '', { ...getCookieOptions(0), maxAge: 0 })
}

export async function refreshWithToken(refreshToken: string): Promise<BackendTokenResponse | null> {
  const response = await fetch(`${getBackendApiBaseUrl()}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json() as Promise<BackendTokenResponse>
}

export function buildSessionPayload(accessToken: string): SessionPayload | null {
  return decodeJwtPayload<SessionPayload>(accessToken)
}
