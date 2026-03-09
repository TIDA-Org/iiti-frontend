export interface Offer {
  id: string
  title: string
  description: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  applicableCourses: string[]
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
}
