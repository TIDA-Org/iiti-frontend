import { COURSES, COURSE_OUTLINES } from '@/lib/data/courses'
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent'

export default function ExcavatorCoursePage() {
  const course = COURSES.find(c => c.slug === 'excavator')!
  const outline = COURSE_OUTLINES['c2']
  return <CourseDetailContent course={course} outline={outline} />
}
