import { Role } from '@/types/common'

export const PERMISSIONS: Record<Role, string[]> = {
  super_admin: [
    'view:dashboard', 'manage:students', 'manage:courses', 'manage:enrollments',
    'manage:payments', 'manage:results', 'manage:certificates', 'manage:vacancies',
    'manage:offers', 'manage:intakes', 'manage:users', 'manage:settings',
    'view:audit_logs', 'manage:migration', 'view:reports',
    // Backend permission codes
    'payments.view', 'payments.create', 'payments.update',
    'payments.verify_receipt', 'payments.reject_receipt',
    'notifications.view', 'notifications.update',
  ],
  admin: [
    'view:dashboard', 'manage:students', 'manage:courses', 'manage:enrollments',
    'manage:payments', 'manage:results', 'manage:certificates', 'manage:vacancies',
    'manage:offers', 'manage:intakes', 'view:reports',
    // Backend permission codes
    'payments.view', 'payments.create', 'payments.update',
    'payments.verify_receipt', 'payments.reject_receipt',
    'notifications.view', 'notifications.update',
  ],
  front_desk: [
    'view:dashboard', 'manage:students', 'manage:enrollments',
    'manage:payments', 'view:courses', 'view:reports',
    // Backend permission codes
    'payments.view', 'payments.create', 'payments.update',
    'payments.verify_receipt', 'payments.reject_receipt',
    'notifications.view',
  ],
  student: [
    'view:portal', 'view:own_courses', 'view:own_payments',
    'view:own_results', 'view:own_certificates', 'view:vacancies',
    // Backend permission codes
    'notifications.view',
  ],
}

export function hasPermission(role: Role, permission: string): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false
}
