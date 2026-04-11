import { apiFetch, clearTokens, getRefreshToken, setTokens } from './core'

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  account_type: 'student' | 'staff'
  account_id: string
}

export async function apiLogin(username: string, password: string): Promise<LoginResponse> {
  const data = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })
  setTokens(data.access_token, data.refresh_token)
  return data
}

export async function apiLogout(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      })
    } catch {
      // Logout should not fail silently
    }
  }
  clearTokens()
}

export async function apiForgotPassword(username: string): Promise<{ message: string }> {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username }) })
}

export async function apiResetPassword(username: string, otp: string, newPassword: string): Promise<{ message: string }> {
  return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ username, otp, new_password: newPassword }) })
}
