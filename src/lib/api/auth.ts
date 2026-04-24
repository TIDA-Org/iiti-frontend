import { ApiError, apiFetch } from './core'

export interface LoginResponse {
  token_type: string
  account_type: 'student' | 'staff'
  account_id: string
  username: string
  role_slug?: string
}

export interface SessionResponse {
  account_id: string
  account_type: 'student' | 'staff'
  username: string
  role_slug?: string
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, data?.error?.code || 'login_failed', data?.error?.message || 'Login failed')
  }

  return data as LoginResponse
}

export async function apiLogout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => null)
}

export async function apiGetSession(): Promise<SessionResponse> {
  const response = await fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, data?.error?.code || 'session_unavailable', data?.error?.message || 'Session unavailable')
  }

  return data as SessionResponse
}

export async function apiForgotPassword(username: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username }) })
}

export async function apiResetPassword(username: string, otp: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ username, otp, new_password: newPassword }) })
}
