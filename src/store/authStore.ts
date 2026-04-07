import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types/auth'
import { apiLogin, apiLogout, apiGetMyProfile, clearTokens, getAccessToken, ApiError } from '@/lib/api'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  account_id: string
  account_type: string
  username: string
  role_slug?: string
  exp: number
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; role?: string }>
  logout: () => void
  clearError: () => void
  hydrateUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiLogin(username, password)

          // Decode the access token to get user info
          const decoded = jwtDecode<JwtPayload>(response.access_token)
          const isStudent = response.account_type === 'student'

          let authUser: AuthUser

          if (isStudent) {
            // Fetch student profile to get name and student number
            try {
              const profile = await apiGetMyProfile()
              authUser = {
                id: response.account_id,
                name: profile.full_name,
                email: profile.email || decoded.username,
                role: 'student',
                studentId: profile.student_number,
              }
            } catch {
              // Fallback if profile fetch fails
              authUser = {
                id: response.account_id,
                name: decoded.username,
                email: decoded.username,
                role: 'student',
              }
            }
          } else {
            // Staff user - get role from JWT
            const role = decoded.role_slug || 'admin'
            authUser = {
              id: response.account_id,
              name: decoded.username,
              email: decoded.username,
              role: role as AuthUser['role'],
            }
          }

          set({ user: authUser, isAuthenticated: true, isLoading: false, error: null })
          return { success: true, role: authUser.role }
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Login failed. Please try again.'
          set({ isLoading: false, error: message })
          return { success: false }
        }
      },

      logout: async () => {
        try {
          await apiLogout()
        } catch {
          // Ensure logout completes even if API call fails
        }
        clearTokens()
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),

      hydrateUser: async () => {
        const token = getAccessToken()
        if (!token || !get().isAuthenticated) return

        try {
          const decoded = jwtDecode<JwtPayload>(token)
          // Check token expiry
          if (decoded.exp * 1000 < Date.now()) {
            clearTokens()
            set({ user: null, isAuthenticated: false })
          }
        } catch {
          clearTokens()
          set({ user: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'iiti-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
