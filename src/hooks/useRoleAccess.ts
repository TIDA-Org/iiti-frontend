import { useAuthStore } from '@/store/authStore'
import { hasPermission } from '@/lib/permissions'

export function useRoleAccess() {
  const { user } = useAuthStore()

  return {
    role: user?.role,
    can: (permission: string) => {
      if (!user) return false
      return hasPermission(user.role, permission)
    },
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isSuperAdmin: user?.role === 'super_admin',
    isFrontDesk: user?.role === 'front_desk',
    isStudent: user?.role === 'student',
  }
}
