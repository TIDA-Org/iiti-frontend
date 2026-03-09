import { EnrollmentStatus } from './common'

export interface Enrollment {
  id: string
  studentId: string
  courseId: string
  batchId?: string
  status: EnrollmentStatus
  enrolledAt: string
  completedAt?: string
  paymentPlan: 'full' | 'installment'
  installments?: number
  notes?: string
}
