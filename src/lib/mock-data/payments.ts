import { Payment } from '@/types/payment'

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', enrollmentId: 'e1', studentId: 's1', amount: 12000, method: 'bank_transfer', status: 'paid', receiptNo: 'IITI-REC-2025-001', paidAt: '2025-01-22T00:00:00Z', installmentNumber: 1, recordedBy: '3' },
  { id: 'p2', enrollmentId: 'e1', studentId: 's1', amount: 12000, method: 'cash', status: 'paid', receiptNo: 'IITI-REC-2025-002', paidAt: '2025-02-15T00:00:00Z', installmentNumber: 2, recordedBy: '3' },
  { id: 'p3', enrollmentId: 'e1', studentId: 's1', amount: 11000, method: 'cash', status: 'pending', receiptNo: 'IITI-REC-2025-003', dueDate: '2025-03-15T00:00:00Z', installmentNumber: 3 },
  { id: 'p4', enrollmentId: 'e2', studentId: 's2', amount: 45000, method: 'bank_transfer', status: 'paid', receiptNo: 'IITI-REC-2025-004', paidAt: '2025-01-26T00:00:00Z', recordedBy: '2' },
  { id: 'p5', enrollmentId: 'e3', studentId: 's3', amount: 20000, method: 'online', status: 'paid', receiptNo: 'IITI-REC-2025-005', paidAt: '2025-02-03T00:00:00Z', installmentNumber: 1, recordedBy: '3' },
  { id: 'p6', enrollmentId: 'e3', studentId: 's3', amount: 20000, method: 'cash', status: 'pending', receiptNo: 'IITI-REC-2025-006', dueDate: '2025-03-20T00:00:00Z', installmentNumber: 2 },
  { id: 'p7', enrollmentId: 'e6', studentId: 's6', amount: 35000, method: 'bank_transfer', status: 'paid', receiptNo: 'IITI-REC-2024-050', paidAt: '2024-06-16T00:00:00Z', recordedBy: '2' },
  { id: 'p8', enrollmentId: 'e7', studentId: 's7', amount: 40000, method: 'cash', status: 'paid', receiptNo: 'IITI-REC-2024-051', paidAt: '2024-07-22T00:00:00Z', recordedBy: '3' },
]
