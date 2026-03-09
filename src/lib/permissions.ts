import { Role } from '@/types/common'

export const PERMISSIONS: Record<Role, string[]> = {
  super_admin: [
    'view:dashboard', 'manage:students', 'manage:courses', 'manage:enrollments',
    'manage:payments', 'manage:results', 'manage:certificates', 'manage:vacancies',
    'manage:offers', 'manage:intakes', 'manage:users', 'manage:settings',
    'view:audit_logs', 'manage:migration', 'view:reports'
  ],
  admin: [
    'view:dashboard', 'manage:students', 'manage:courses', 'manage:enrollments',
    'manage:payments', 'manage:results', 'manage:certificates', 'manage:vacancies',
    'manage:offers', 'manage:intakes', 'view:reports'
  ],
  front_desk: [
    'view:dashboard', 'manage:students', 'manage:enrollments',
    'manage:payments', 'view:courses', 'view:reports'
  ],
  student: [
    'view:portal', 'view:own_courses', 'view:own_payments',
    'view:own_results', 'view:own_certificates', 'view:vacancies'
  ],
}

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false
}
