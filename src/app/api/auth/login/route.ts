import { NextRequest, NextResponse } from 'next/server'

import {
  applyAuthCookies,
  buildSessionPayload,
  getBackendApiBaseUrl,
  type BackendTokenResponse,
} from '@/lib/server/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const response = await fetch(`${getBackendApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': request.headers.get('user-agent') || 'Next.js auth proxy',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    return NextResponse.json(payload || { error: { message: 'Login failed' } }, { status: response.status })
  }

  const tokenResponse = payload as BackendTokenResponse
  const session = buildSessionPayload(tokenResponse.access_token)
  const nextResponse = NextResponse.json({
    account_id: tokenResponse.account_id,
    account_type: tokenResponse.account_type,
    token_type: tokenResponse.token_type,
    username: session?.username || '',
    role_slug: session?.role_slug,
  })

  applyAuthCookies(nextResponse, tokenResponse)
  return nextResponse
}
