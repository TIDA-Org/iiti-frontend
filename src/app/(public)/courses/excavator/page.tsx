import { MOCK_COURSES, COURSE_OUTLINES } from '@/lib/mock-data/courses'
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent'

export default function ExcavatorCoursePage() {
  const course = MOCK_COURSES.find(c => c.slug === 'excavator')!
  const outline = COURSE_OUTLINES['c2']
  return <CourseDetailContent course={course} outline={outline} />
}
