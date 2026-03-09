import { MOCK_COURSES, COURSE_OUTLINES } from '@/lib/mock-data/courses'
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent'

export default function ForkliftCoursePage() {
  const course = MOCK_COURSES.find(c => c.slug === 'forklift')!
  const outline = COURSE_OUTLINES['c1']
  return <CourseDetailContent course={course} outline={outline} />
}
