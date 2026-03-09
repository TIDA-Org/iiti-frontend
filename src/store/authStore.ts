import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types/auth'
import { MOCK_USERS, MOCK_CREDENTIALS } from '@/lib/mock-data/users'
import { delay } from '@/lib/utils'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string }>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        await delay(600)

        const expectedPassword = MOCK_CREDENTIALS[email]
        if (!expectedPassword || expectedPassword !== password) {
          set({ isLoading: false, error: 'Invalid email or password.' })
          return { success: false }
        }

        const user = MOCK_USERS.find(u => u.email === email)
        if (!user) {
          set({ isLoading: false, error: 'User not found.' })
          return { success: false }
        }

        const authUser: AuthUser = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
          avatar: user.avatar,
        }

        set({ user: authUser, isAuthenticated: true, isLoading: false, error: null })
        return { success: true, role: user.role }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'iiti-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
