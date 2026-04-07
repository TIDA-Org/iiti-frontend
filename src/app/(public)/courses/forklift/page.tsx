import { COURSES, COURSE_OUTLINES } from '@/lib/data/courses'
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent'

export default function ForkliftCoursePage() {
  const course = COURSES.find(c => c.slug === 'forklift')!
  const outline = COURSE_OUTLINES['c1']
  return <CourseDetailContent course={course} outline={outline} />
}
