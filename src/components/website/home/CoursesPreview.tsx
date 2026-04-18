'use client'

import Link from 'next/link'
import { ArrowRight, Clock, Loader2 } from 'lucide-react'

import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { getPublicCourseHref } from '@/lib/public-course-routes'
import { getCourseAccent, getCourseDuration, getCourseIcon, getFeaturedCourses } from '@/lib/public-course-display'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { Card } from '@/components/ui/card'

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
            All programmes are TVEC registered and lead to NVQ Level 3 certification — recognized by local and international employers.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {isLoading && (
            <div className="col-span-full flex items-center justify-center py-16 text-slate-500">
              <Loader2 className="mr-3 h-5 w-5 animate-spin text-orange-500" />
              Loading courses...
            </div>
          )}

          {!isLoading && courses.map((course, i) => {
            const IconComponent = getCourseIcon(course)
            const accentColor = getCourseAccent(course)
            return (
              <ScrollReveal key={course.id} delay={i * 0.1}>
                <Card className="group relative overflow-hidden border border-slate-200/50 bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  {/* Accent line at top */}
                  <div className={`h-1 w-full bg-linear-to-r ${accentColor}`} />
                  
                  <div className="p-8 flex flex-col flex-1">
                    {/* Icon and Badge Row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-lg bg-linear-to-br ${accentColor} flex items-center justify-center text-white shadow-sm`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                        {course.course_code}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug group-hover:text-orange-600 transition-all duration-300">
                      {course.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                      {course.description || 'Professional heavy machinery training aligned with current institute standards and certification pathways.'}
                    </p>

                    {/* Bottom Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      {/* Certifications */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded">
                          NVQ Level 3
                        </span>
                        <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded">
                          TVEC Registered
                        </span>
                      </div>

                      {/* Duration and CTA */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{getCourseDuration(course)}</span>
                        </div>
                        <Link
                          href={getPublicCourseHref(course)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 group/link transition-colors"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/5 pointer-events-none transition-colors duration-300" />
                </Card>
              </ScrollReveal>
            )
          })}

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
