import { PaymentStatus } from './common'

export interface Payment {
  id: string
  enrollmentId: string
  studentId: string
  amount: number
  method: 'cash' | 'bank_transfer' | 'online' | 'payhere'
  status: PaymentStatus
  receiptNo: string
  paidAt?: string
  dueDate?: string
  installmentNumber?: number
  notes?: string
  recordedBy?: string
}
