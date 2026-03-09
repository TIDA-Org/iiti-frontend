export type Role = 'super_admin' | 'admin' | 'front_desk' | 'student'

export type Status = 'active' | 'inactive' | 'suspended' | 'pending'

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'withdrawn'

export type CertificateType = 'institute' | 'skill_id' | 'nvq'

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F' | 'Pass' | 'Fail' | 'Distinction'

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface SelectOption {
  value: string
  label: string
}
