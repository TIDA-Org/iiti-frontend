import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiGetSession, apiLogin, apiLogout } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/core'
import { apiGetMyProfile } from '@/lib/api/students'
import { AuthUser } from '@/types/auth'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  login: (username: string, password: string) => Promise<{ success: boolean; role?: string }>
  logout: () => Promise<void>
  clearError: () => void
  hydrateUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      _hasHydrated: false,

      setHasHydrated: (v: boolean) => set({ _hasHydrated: v }),

      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null })

        try {
          const response = await apiLogin(username, password)
          const isStudent = response.account_type === 'student'

          let authUser: AuthUser

          if (isStudent) {
            try {
              const profile = await apiGetMyProfile()
              authUser = {
                id: response.account_id,
                name: profile.full_name,
                email: profile.email || response.username,
                role: 'student',
                studentId: profile.student_number,
              }
            } catch {
              authUser = {
                id: response.account_id,
                name: response.username,
                email: response.username,
                role: 'student',
              }
            }
          } else {
            const role = response.role_slug || 'admin'
            authUser = {
              id: response.account_id,
              name: response.username,
              email: response.username,
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
          // Clear local auth state even if the logout request fails.
        }
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),

      hydrateUser: async () => {
        try {
          const session = await apiGetSession()

          if (session.account_type === 'student') {
            try {
              const profile = await apiGetMyProfile()
              set({
                user: {
                  id: session.account_id,
                  name: profile.full_name,
                  email: profile.email || session.username,
                  role: 'student',
                  studentId: profile.student_number,
                },
                isAuthenticated: true,
                error: null,
              })
              return
            } catch {
              set({
                user: {
                  id: session.account_id,
                  name: session.username,
                  email: session.username,
                  role: 'student',
                },
                isAuthenticated: true,
                error: null,
              })
              return
            }
          }

          set({
            user: {
              id: session.account_id,
              name: session.username,
              email: session.username,
              role: (session.role_slug || 'admin') as AuthUser['role'],
            },
            isAuthenticated: true,
            error: null,
          })
        } catch {
          set({ user: null, isAuthenticated: false, error: null })
        }
      },
    }),
    {
      name: 'iiti-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
