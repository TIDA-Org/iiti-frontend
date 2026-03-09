export interface Intake {
  id: string
  courseId: string
  batchName: string
  startDate: string
  endDate: string
  maxCapacity: number
  enrolledCount: number
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}
