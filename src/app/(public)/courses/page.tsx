'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { CourseLanguageProvider, CourseLanguageSwitch, useCourseLanguage } from '@/components/website/courses/CourseLanguageProvider'
import { CourseImageCard } from '@/components/ui/course-image-card'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { getPublicCourseHref } from '@/lib/public-course-routes'
import { getCourseCardImage, getCourseDuration, getCourseThemeColor } from '@/lib/public-course-display'
import {
  getCourseLanguageHref,
  getCourseTextClass,
  getLocalizedCourseDescription,
  getLocalizedCourseName,
  getLocalizedDurationLabel,
} from '@/lib/public-course-language'
import { cn } from '@/lib/utils'

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesPageFallback />}>
      <CourseLanguageProvider>
        <CoursesPageContent />
      </CourseLanguageProvider>
    </Suspense>
  )
}

function CoursesPageFallback() {
  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 px-4 py-20 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Our Programmes</SectionLabel>
          <h1 className="mb-4 text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
            All Training Programmes
          </h1>
        </ScrollReveal>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-4 text-slate-500">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-500" />
          Loading courses...
        </div>
      </section>
    </div>
  )
}

function CoursesPageContent() {
  const { data, isLoading, error, refetch } = useApi(() => apiGetCourses(), [])
  const { lang, copy } = useCourseLanguage()
  const courses = (data || [])
    .filter((course) => course.is_active)
    .sort((left, right) => left.display_order - right.display_order)
  const titleStyle = lang === 'en' ? { fontFamily: 'Outfit, sans-serif' } : undefined

  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className={cn('justify-center', getCourseTextClass(lang))}>{copy.catalogueLabel}</SectionLabel>
          <h1 className={cn('mb-4 text-4xl font-extrabold text-white lg:text-5xl', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>
            {copy.catalogueTitle}
          </h1>
          <p className={cn('mx-auto max-w-2xl text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
            {copy.catalogueDescription}
          </p>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10 flex justify-end">
            <CourseLanguageSwitch />
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-500" />
              <span className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.loadingCourses}</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-200 bg-white p-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                <span className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.retry}</span>
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <ScrollReveal key={course.id} delay={index * 0.08} className="h-105">
                  <CourseImageCard
                    imageUrl={getCourseCardImage(course)}
                    title={getLocalizedCourseName(course, lang)}
                    description={getLocalizedCourseDescription(
                      course,
                      lang,
                      'Professional training aligned with current institute standards and certification pathways.',
                    )}
                    duration={getLocalizedDurationLabel(
                      course.duration_options.find((option) => option.is_available) ??
                        { ...course.duration_options[0], label: getCourseDuration(course), label_si: null },
                      lang,
                    )}
                    code={course.course_code}
                    href={getCourseLanguageHref(getPublicCourseHref(course), lang)}
                    themeColor={getCourseThemeColor(course)}
                    learnMoreLabel={copy.learnMore}
                    className="h-full"
                  />
                </ScrollReveal>
              ))}

              {courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
                  <span className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.noActiveCourses}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
