import { NextRequest, NextResponse } from 'next/server'

import {
  REFRESH_TOKEN_COOKIE,
  clearAuthCookies,
  getBackendApiBaseUrl,
} from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  if (refreshToken) {
    await fetch(`${getBackendApiBaseUrl()}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: 'no-store',
    }).catch(() => null)
  }

  const response = NextResponse.json({ message: 'Logged out successfully' })
  clearAuthCookies(response)
  return response
}
