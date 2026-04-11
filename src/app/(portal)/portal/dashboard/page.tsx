'use client'

import { useMemo } from 'react'
import { apiGetMyCertificates } from '@/lib/api/certificates'
import { apiGetMyResults } from '@/lib/api/results'
import { apiGetMyEnrollments } from '@/lib/api/enrollments'
import { apiGetCourse } from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { useAuthStore } from '@/store/authStore'
import { useStudentPortalStore } from '@/store/studentPortalStore'
import Link from 'next/link'
import { ArrowRight, Award, Bell, BookOpen, CreditCard, FileText } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function PortalDashboardPage() {
  const { user } = useAuthStore()
  const { notifications } = useStudentPortalStore()

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useApi(
    () => apiGetMyEnrollments(),
    [],
  )

  const {
    data: counters,
    isLoading: countersLoading,
    refetch: refetchCounters,
  } = useApi(
    async () => {
      const [resultsResult, certificatesResult] = await Promise.allSettled([
        apiGetMyResults(1, 1),
        apiGetMyCertificates(1, 1),
      ])

      return {
        resultsCount: resultsResult.status === 'fulfilled' ? resultsResult.value.total : 0,
        certificatesCount: certificatesResult.status === 'fulfilled' ? certificatesResult.value.total : 0,
      }
    },
    [],
  )

  const recentEnrollments = useMemo(() => {
    return [...(enrollments || [])]
      .sort((a, b) => Date.parse(b.enrollment_date) - Date.parse(a.enrollment_date))
      .slice(0, 3)
  }, [enrollments])

  const recentEnrollmentCourseIds = useMemo(() => {
    return Array.from(new Set(recentEnrollments.map((enrollment) => enrollment.course_id)))
  }, [recentEnrollments])

  const { data: recentCourseMap, refetch: refetchRecentCourses } = useApi(
    async () => {
      const pairs = await Promise.allSettled(
        recentEnrollmentCourseIds.map(async (courseId) => {
          const course = await apiGetCourse(courseId)
          return [courseId, { name: course.name, course_code: course.course_code }] as const
        }),
      )

      return pairs.reduce<Record<string, { name: string; course_code: string }>>((acc, pair) => {
        if (pair.status === 'fulfilled') {
          const [courseId, data] = pair.value
          acc[courseId] = data
        }
        return acc
      }, {})
    },
    [recentEnrollmentCourseIds.join('|')],
  )

  const enrolledCount = enrollments?.length || 0
  const outstandingBalance = (enrollments || []).reduce((sum, item) => {
    const remaining = Math.max((item.total_fee_at_enrollment || 0) - (item.amount_paid || 0), 0)
    return sum + remaining
  }, 0)

  const recentNotifications = notifications.slice(0, 4)

  const summaryCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: enrollmentsLoading ? '...' : enrolledCount, href: '/portal/courses', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: CreditCard, label: 'Outstanding Balance', value: enrollmentsLoading ? '...' : `LKR ${outstandingBalance.toLocaleString()}`, href: '/portal/payments', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: FileText, label: 'Results Available', value: countersLoading ? '...' : (counters?.resultsCount || 0), href: '/portal/results', color: 'text-green-500', bg: 'bg-green-50' },
    { icon: Award, label: 'Certificates', value: countersLoading ? '...' : (counters?.certificatesCount || 0), href: '/portal/certificates', color: 'text-purple-500', bg: 'bg-purple-50' },
  ]

  return (
    <div>
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-orange-100 text-xs md:text-sm mb-1">{getGreeting()},</p>
            <h1 className="text-xl md:text-2xl font-bold">{user?.name}</h1>
            <p className="text-orange-100 text-xs md:text-sm mt-1">Student ID: {user?.studentId}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href} className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-4 hover:shadow-md transition-all duration-200 group">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-lg md:text-xl font-bold text-slate-800">{card.value}</div>
              <div className="text-xs md:text-sm text-slate-500 mt-0.5">{card.label}</div>
            </Link>
          )
        })}
      </div>

      {enrollmentsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Could not load dashboard enrollments.
          <button onClick={() => { refetchEnrollments(); refetchCounters(); refetchRecentCourses() }} className="ml-2 font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Enrolled courses */}
          <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-sm md:text-base">My Courses</h3>
              <Link href="/portal/courses" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {enrollmentsLoading ? (
              <p className="text-sm text-slate-400 text-center py-6">Loading courses...</p>
            ) : recentEnrollments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No enrollments found.</p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment) => {
                  const course = recentCourseMap?.[enrollment.course_id]
                  return (
                    <div key={enrollment.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="text-sm font-medium text-slate-700 truncate">{course?.name || 'Course unavailable'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{course?.course_code || enrollment.course_id.slice(0, 8)}</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-sm md:text-base">Payment Summary</h3>
              <Link href="/portal/payments" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs text-slate-500">Outstanding Balance</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{enrollmentsLoading ? 'Loading...' : `LKR ${outstandingBalance.toLocaleString()}`}</p>
              <p className="text-xs text-slate-400 mt-2">Calculated from enrollment totals and paid amounts.</p>
            </div>
          </div>

          {/* Recent notifications */}
          <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-4 md:p-5 lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700 text-sm md:text-base">Recent Notifications</h3>
              <Link href="/portal/notifications" className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium">View all <ArrowRight className="w-3 h-3" /></Link>
            </div>
            {recentNotifications.length === 0 ? (
              <div className="text-center py-6">
                <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm text-slate-700">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>
    </div>
  )
}
