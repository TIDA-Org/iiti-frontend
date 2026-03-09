import { Result } from '@/types/result'

export const MOCK_RESULTS: Result[] = [
  { id: 'r1', enrollmentId: 'e6', studentId: 's6', courseId: 'c1', theoryScore: 85, practicalScore: 88, finalGrade: 'A', isPublished: true, publishedAt: '2024-07-25T00:00:00Z', examDate: '2024-07-20T00:00:00Z' },
  { id: 'r2', enrollmentId: 'e7', studentId: 's7', courseId: 'c3', theoryScore: 72, practicalScore: 78, finalGrade: 'B', isPublished: true, publishedAt: '2024-09-10T00:00:00Z', examDate: '2024-09-05T00:00:00Z' },
  { id: 'r3', enrollmentId: 'e8', studentId: 's8', courseId: 'c2', theoryScore: 90, practicalScore: 92, finalGrade: 'Distinction', isPublished: false, examDate: '2025-03-01T00:00:00Z' },
]
