import { NextRequest, NextResponse } from 'next/server'

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  applyAuthCookies,
  buildSessionPayload,
  clearAuthCookies,
  refreshWithToken,
} from '@/lib/server/auth'

function isExpired(exp?: number) {
  if (!exp) return false
  return exp <= Math.floor(Date.now() / 1000)
}

export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  let refreshedTokens = null

  const currentSession = accessToken ? buildSessionPayload(accessToken) : null

  if ((!accessToken || !currentSession || isExpired(currentSession.exp)) && refreshToken) {
    refreshedTokens = await refreshWithToken(refreshToken)
    accessToken = refreshedTokens?.access_token
  }

  if (!accessToken) {
    const response = NextResponse.json({ error: { message: 'Unauthenticated' } }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  const session = buildSessionPayload(accessToken)
  if (!session || isExpired(session.exp)) {
    const response = NextResponse.json({ error: { message: 'Session expired' } }, { status: 401 })
    clearAuthCookies(response)
    return response
  }

  const response = NextResponse.json({
    account_id: session.account_id,
    account_type: session.account_type,
    username: session.username,
    role_slug: session.role_slug,
  })

  if (refreshedTokens) {
    applyAuthCookies(response, refreshedTokens)
  }

  return response
}
