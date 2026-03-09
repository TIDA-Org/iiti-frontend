import { Offer } from '@/types/offer'

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'o1', title: '2025 Early Bird Discount',
    description: 'Enroll before April 30, 2025 and get 10% off course fees.',
    discountType: 'percentage', discountValue: 10,
    applicableCourses: ['c1', 'c2', 'c3'],
    validFrom: '2025-01-01T00:00:00Z', validUntil: '2025-04-30T00:00:00Z',
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'o2', title: 'Multiple Course Bundle',
    description: 'Enroll in 2 or more courses and save LKR 5,000.',
    discountType: 'fixed', discountValue: 5000,
    applicableCourses: ['c1', 'c2', 'c3'],
    validFrom: '2025-01-01T00:00:00Z', validUntil: '2025-12-31T00:00:00Z',
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
]
