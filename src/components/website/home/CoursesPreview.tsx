'use client'

import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'

import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { getPublicCourseHref } from '@/lib/public-course-routes'
import { getCourseCardImage, getCourseThemeColor, getCourseDuration, getFeaturedCourses } from '@/lib/public-course-display'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { CourseImageCard } from '@/components/ui/course-image-card'

export function CoursesPreview() {
  const { data, isLoading } = useApi(() => apiGetCourses(), [])
  const courses = getFeaturedCourses(
    (data || [])
      .filter((course) => course.is_active)
      .sort((left, right) => left.display_order - right.display_order),
  )

  return (
    <section className="py-28 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <SectionLabel className="justify-center">Our Programmes</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Industry-Ready Training for
            <br />
            <span className="text-orange-500">Modern Heavy Machinery</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All programmes are TVEC registered and lead to NVQ Level 3 certification —
            recognized by local and international employers.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-500" />
              Loading courses...
            </div>
          )}

          {!isLoading &&
            courses.map((course, i) => (
              <ScrollReveal key={course.id} delay={i * 0.1} className="h-[420px]">
                <CourseImageCard
                  imageUrl={getCourseCardImage(course)}
                  title={course.name}
                  description={
                    course.description ||
                    'Professional heavy machinery training aligned with current institute standards.'
                  }
                  duration={getCourseDuration(course)}
                  code={course.course_code}
                  href={getPublicCourseHref(course)}
                  themeColor={getCourseThemeColor(course)}
                  className="h-full"
                />
              </ScrollReveal>
            ))}

          {!isLoading && courses.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No active courses are available right now.
            </div>
          )}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 hover:shadow-lg"
          >
            View All Programmes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
