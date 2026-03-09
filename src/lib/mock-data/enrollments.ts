import { Enrollment } from '@/types/enrollment'

export const MOCK_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', studentId: 's1', courseId: 'c1', status: 'active', enrolledAt: '2025-01-20T00:00:00Z', paymentPlan: 'installment', installments: 3 },
  { id: 'e2', studentId: 's2', courseId: 'c2', status: 'active', enrolledAt: '2025-01-25T00:00:00Z', paymentPlan: 'full' },
  { id: 'e3', studentId: 's3', courseId: 'c3', status: 'active', enrolledAt: '2025-02-01T00:00:00Z', paymentPlan: 'installment', installments: 2 },
  { id: 'e4', studentId: 's4', courseId: 'c1', status: 'pending', enrolledAt: '2025-02-15T00:00:00Z', paymentPlan: 'full' },
  { id: 'e5', studentId: 's5', courseId: 'c2', status: 'pending', enrolledAt: '2025-02-20T00:00:00Z', paymentPlan: 'installment', installments: 4 },
  { id: 'e6', studentId: 's6', courseId: 'c1', status: 'completed', enrolledAt: '2024-06-15T00:00:00Z', completedAt: '2024-07-20T00:00:00Z', paymentPlan: 'full' },
  { id: 'e7', studentId: 's7', courseId: 'c3', status: 'completed', enrolledAt: '2024-07-20T00:00:00Z', completedAt: '2024-09-05T00:00:00Z', paymentPlan: 'full' },
  { id: 'e8', studentId: 's8', courseId: 'c2', status: 'active', enrolledAt: '2024-08-25T00:00:00Z', paymentPlan: 'installment', installments: 3 },
]
