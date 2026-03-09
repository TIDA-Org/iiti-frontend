import { Intake } from '@/types/intake'

export const MOCK_INTAKES: Intake[] = [
  { id: 'i1', courseId: 'c1', batchName: 'FO-2025-B1', startDate: '2025-04-07', endDate: '2025-05-02', maxCapacity: 15, enrolledCount: 8, status: 'upcoming' },
  { id: 'i2', courseId: 'c2', batchName: 'EX-2025-B1', startDate: '2025-04-14', endDate: '2025-05-23', maxCapacity: 12, enrolledCount: 5, status: 'upcoming' },
  { id: 'i3', courseId: 'c3', batchName: 'BL-2025-B1', startDate: '2025-04-21', endDate: '2025-05-23', maxCapacity: 12, enrolledCount: 10, status: 'upcoming' },
  { id: 'i4', courseId: 'c1', batchName: 'FO-2025-B2', startDate: '2025-03-03', endDate: '2025-03-28', maxCapacity: 15, enrolledCount: 15, status: 'ongoing' },
]
