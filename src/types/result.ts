import { Grade } from './common'

export interface Result {
  id: string
  enrollmentId: string
  studentId: string
  courseId: string
  theoryScore?: number
  practicalScore?: number
  finalGrade: Grade
  isPublished: boolean
  publishedAt?: string
  examDate?: string
  remarks?: string
}
