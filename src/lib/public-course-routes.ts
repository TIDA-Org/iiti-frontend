import { type CourseApiResponse } from '@/lib/api/courses'

export function getPublicCourseHref(course: Pick<CourseApiResponse, 'course_code' | 'category'>) {
  const categorySlug = course.category?.slug || 'programmes'
  const courseCode = course.course_code.toLowerCase()
  return `/courses/${encodeURIComponent(categorySlug)}/${encodeURIComponent(courseCode)}`
}
