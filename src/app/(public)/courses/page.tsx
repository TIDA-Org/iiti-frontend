'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle, Clock, Loader2 } from 'lucide-react'

import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { getPublicCourseHref } from '@/lib/public-course-routes'
import { getCourseAccent, getCourseDuration, getCourseIcon } from '@/lib/public-course-display'
import { formatLKR } from '@/lib/utils'

export default function CoursesPage() {
  const { data, isLoading, error, refetch } = useApi(() => apiGetCourses(), [])
  const courses = (data || [])
    .filter((course) => course.is_active)
    .sort((left, right) => left.display_order - right.display_order)

  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Our Programmes</SectionLabel>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            All Training Programmes
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Browse all live courses from the institute system, including full programmes, package options, and one-day certification routes.
          </p>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-500" />
              Loading courses...
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
                Retry
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <div className="grid gap-8">
              {courses.map((course, index) => {
                const IconComponent = getCourseIcon(course)
                const accentColor = getCourseAccent(course)

                return (
                  <ScrollReveal key={course.id} delay={index * 0.08}>
                    <div className="overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div className={`h-2 bg-linear-to-r ${accentColor}`} />
                      <div className="p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                          <div className="flex-1">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-600">{course.nvq_level ? `NVQ Level ${course.nvq_level}` : 'Professional Training'}</span>
                              {course.is_nvq_linked && (
                                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">TVEC Registered</span>
                              )}
                              <span className="text-xs text-stone-400">{course.course_code}</span>
                            </div>

                            <div className="mb-4 flex items-start gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br ${accentColor} text-white shadow-sm`}>
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <h2 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                  {course.name}
                                </h2>
                                <p className="mt-2 max-w-3xl leading-relaxed text-stone-500">
                                  {course.description || 'Professional training aligned with current institute standards and certification pathways.'}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" />Duration: {getCourseDuration(course)}</span>
                            </div>

                            <div className="mt-4 space-y-1.5">
                              {['Institute Certificate', 'Skill ID Card', course.is_nvq_linked ? 'NVQ Level 3 Certificate' : 'Programme Completion Record'].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-stone-600">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex min-w-52 flex-col gap-3">
                            <div className="rounded-xl bg-orange-50 p-4 text-center">
                              <p className="mb-1 text-xs text-stone-400">Course Fee</p>
                              <p className="text-2xl font-extrabold text-orange-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                {formatLKR(course.total_fee)}
                              </p>
                            </div>
                            <Link
                              href={getPublicCourseHref(course)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                            >
                              Learn More <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                              href="/apply"
                              className="flex items-center justify-center gap-2 rounded-xl border border-orange-300 py-3 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
                            >
                              Apply Now
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}

              {courses.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
                  No active courses are available right now.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
