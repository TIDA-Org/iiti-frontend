"use client"

import Link from 'next/link'
import { useMemo } from 'react'
import { BadgeInfo, BookOpen, CalendarDays, ChevronRight } from 'lucide-react'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses, type CourseApiResponse } from '@/lib/api/courses'
import { apiGetMyEnrollments } from '@/lib/api/enrollments'

function formatDate(value: string) {
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return '-'
  return new Date(parsed).toLocaleDateString()
}

function toLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PortalCoursesPage() {
  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useApi(() => apiGetMyEnrollments(), [])

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApi(() => apiGetCourses(), [])

  const courseById = useMemo(() => {
    const map = new Map<string, CourseApiResponse>()
    ;(courses ?? []).forEach((course) => map.set(course.id, course))
    return map
  }, [courses])

  const items = useMemo(() => {
    return (enrollments || []).map((enrollment) => ({
      enrollment,
      course: courseById.get(enrollment.course_id),
    }))
  }, [courseById, enrollments])

  const isLoading = enrollmentsLoading || coursesLoading
  const error = enrollmentsError || coursesError

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>My Courses</h1>
        <p className="text-stone-500 text-sm mt-1">Your enrolled training programmes</p>
      </div>

      <DataLoader
        isLoading={isLoading}
        error={error}
        onRetry={() => {
          refetchEnrollments()
          refetchCourses()
        }}
      >
        {items.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses enrolled"
            description="You do not have any enrollments yet."
          />
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {items.map(({ enrollment, course }) => (
              <div key={enrollment.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 mb-1">Course</p>
                    <h3 className="text-base font-semibold text-slate-800 truncate">
                      {course?.name || 'Course unavailable'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {course?.course_code || enrollment.course_id.slice(0, 8)}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-orange-50 text-orange-700 px-2.5 py-1 text-xs font-medium border border-orange-200 whitespace-nowrap">
                    {toLabel(enrollment.enrollment_status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="text-xs text-slate-400 mb-1">Payment Plan</div>
                    <div className="font-medium text-slate-700">{toLabel(enrollment.payment_plan)}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="text-xs text-slate-400 mb-1">Enrolled Date</div>
                    <div className="font-medium text-slate-700 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(enrollment.enrollment_date)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <BadgeInfo className="w-3.5 h-3.5" />
                    Enrollment ID: {enrollment.id.slice(0, 8)}...
                  </p>
                  <Link
                    href={`/portal/courses/${enrollment.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700"
                  >
                    View
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DataLoader>
    </div>
  )
}
