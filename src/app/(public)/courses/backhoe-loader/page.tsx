import { COURSES, COURSE_OUTLINES } from '@/lib/data/courses'
import { CourseDetailContent } from '@/components/website/courses/CourseDetailContent'

export default function BackhoeLoaderCoursePage() {
  const course = COURSES.find(c => c.slug === 'backhoe-loader')!
  const outline = COURSE_OUTLINES['c3']
  return <CourseDetailContent course={course} outline={outline} />
}
