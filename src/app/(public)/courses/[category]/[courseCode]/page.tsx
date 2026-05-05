'use client'

import { Suspense } from 'react'

import { DataLoader } from '@/components/shared/DataLoader'
import { CourseLanguageProvider } from '@/components/website/courses/CourseLanguageProvider'
import { CourseApiDetailContent } from '@/components/website/courses/CourseApiDetailContent'
import { useApi } from '@/hooks/useApi'
import { apiGetCourse, apiGetCourses } from '@/lib/api/courses'

interface Props {
  params: { category: string; courseCode: string }
}

export default function Page({ params }: Props) {
  const { category, courseCode } = params
  const { data, isLoading, error, refetch } = useApi(async () => {
    const courses = await apiGetCourses()
    const matchedCourse = courses.find((course) => {
      const categoryMatches = (course.category?.slug || 'programmes').toLowerCase() === category.toLowerCase()
      const codeMatches = course.course_code.toLowerCase() === courseCode.toLowerCase()
      return categoryMatches && codeMatches
    })

    if (!matchedCourse) {
      throw new Error('Course not found')
    }

    return apiGetCourse(matchedCourse.id)
  }, [category, courseCode])

  return (
    <Suspense fallback={null}>
      <CourseLanguageProvider>
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {data ? <CourseApiDetailContent course={data} /> : null}
        </DataLoader>
      </CourseLanguageProvider>
    </Suspense>
  )
}
