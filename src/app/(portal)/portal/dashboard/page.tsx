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
import { useTranslation } from '@/lib/i18n/useTranslation'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  GraduationCap,
} from 'lucide-react'

function getGreeting(t: any) {
  const h = new Date().getHours()
  if (h < 12) return t.dashboard.greetingMorning
  if (h < 17) return t.dashboard.greetingAfternoon
  return t.dashboard.greetingEvening
}

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-LK')}`
}

function getEnrollmentRemaining(enrollment: {
  enrollment_status: string
  total_fee_at_enrollment?: number
  amount_paid?: number
}) {
  if (enrollment.enrollment_status === 'completed') return 0
  return Math.max((enrollment.total_fee_at_enrollment || 0) - (enrollment.amount_paid || 0), 0)
}

export default function PortalDashboardPage() {
  const { user } = useAuthStore()
  const { notifications } = useStudentPortalStore()
  const { t, isSinhala } = useTranslation()

  const currencyLabel = isSinhala ? 'රු.' : 'LKR'

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
    return sum + getEnrollmentRemaining(item)
  }, 0)

  const recentNotifications = notifications.slice(0, 4)

  const summaryCards = [
    {
      icon: BookOpen,
      label: t.dashboard.cardCoursesTitle,
      value: enrollmentsLoading ? '...' : enrolledCount,
      href: '/portal/courses',
      accent: 'from-sky-500/15 to-blue-500/5',
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
      helper: t.dashboard.cardCoursesHelper,
    },
    {
      icon: CreditCard,
      label: t.dashboard.cardBalanceTitle,
      value: enrollmentsLoading ? '...' : formatCurrency(outstandingBalance, currencyLabel),
      href: '/portal/payments',
      accent: 'from-orange-500/15 to-amber-500/5',
      iconColor: 'text-orange-600',
      iconBg: 'bg-orange-100',
      helper: t.dashboard.cardBalanceHelper,
    },
    {
      icon: FileText,
      label: t.dashboard.cardResultsTitle,
      value: countersLoading ? '...' : (counters?.resultsCount || 0),
      href: '/portal/results',
      accent: 'from-emerald-500/15 to-green-500/5',
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      helper: t.dashboard.cardResultsHelper,
    },
    {
      icon: Award,
      label: t.dashboard.cardCertsTitle,
      value: countersLoading ? '...' : (counters?.certificatesCount || 0),
      href: '/portal/certificates',
      accent: 'from-fuchsia-500/15 to-purple-500/5',
      iconColor: 'text-fuchsia-600',
      iconBg: 'bg-fuchsia-100',
      helper: t.dashboard.cardCertsHelper,
    },
  ]

  const quickLinks = [
    { label: t.dashboard.quickLinkCourses, href: '/portal/courses' },
    { label: t.dashboard.quickLinkResults, href: '/portal/results' },
    { label: t.dashboard.quickLinkJobs, href: '/portal/jobs' },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 max-w-full min-w-0">
      <section className="relative overflow-hidden rounded-3xl border border-orange-200/60 bg-linear-to-br from-orange-500 via-orange-500 to-amber-500 px-5 py-6 text-white shadow-[0_30px_70px_-35px_rgba(249,115,22,0.85)] md:px-8 md:py-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-white/12 to-transparent" />
        <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-amber-300/25 blur-2xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm text-orange-100/90">{getGreeting(t)},</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{user?.name}</h1>
            <p className="mt-2 text-sm text-orange-50/90 md:text-base">{t.dashboard.studentIdLabel}: {user?.studentId}</p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-orange-50/85 md:text-base">
              {t.dashboard.heroSubtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/15"
              >
                <div className="flex items-center justify-between gap-3 text-sm font-medium text-white">
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-linear-to-br ${card.accent} p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg`}
            >
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
              <div className="relative z-10">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg} shadow-sm`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">{card.value}</div>
                <div className="mt-1 text-sm font-medium text-slate-700">{card.label}</div>
                <div className="mt-2 text-xs leading-relaxed text-slate-500">{card.helper}</div>
              </div>
            </Link>
          )
        })}
      </section>

      {enrollmentsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {t.dashboard.loadError}
          <button onClick={() => { refetchEnrollments(); refetchCounters(); refetchRecentCourses() }} className="ml-2 font-semibold underline underline-offset-2">
            {t.common.retry}
          </button>
        </div>
      )}

      <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.15fr_0.85fr] min-w-0">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-5 md:p-6 shadow-sm min-w-0">
          <div className="mb-3.5 sm:mb-5 flex items-center justify-between gap-2 sm:gap-4">
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900">{t.dashboard.myCoursesTitle}</h3>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">{t.dashboard.myCoursesSubtitle}</p>
            </div>
            <Link href="/portal/courses" className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700">
              {t.common.viewAll}
              <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Link>
          </div>

          {enrollmentsLoading ? (
            <p className="py-8 sm:py-10 text-center text-xs sm:text-sm text-slate-400">{t.dashboard.coursesLoading}</p>
          ) : recentEnrollments.length === 0 ? (
            <div className="rounded-xl sm:rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 sm:py-10 text-center text-xs sm:text-sm text-slate-400">
              {t.dashboard.noEnrollments}
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {recentEnrollments.map((enrollment, index) => {
                const course = recentCourseMap?.[enrollment.course_id]
                const remaining = getEnrollmentRemaining(enrollment)
                return (
                  <div key={enrollment.id} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-linear-to-r from-white to-slate-50 p-3 sm:p-4 transition-colors hover:border-orange-200 min-w-0">
                    <div className="flex flex-col gap-2.5 sm:gap-4 md:flex-row md:items-center md:justify-between min-w-0">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 sm:mb-2 flex items-center gap-2 min-w-0">
                          <span className="inline-flex h-6 w-6 sm:h-7 sm:min-w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 px-1 text-xs font-semibold text-orange-700">
                            {index + 1}
                          </span>
                          <div className="text-sm sm:text-base font-semibold text-slate-800 truncate min-w-0 flex-1">{course?.name || t.dashboard.courseUnavailable}</div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5 shrink-0" />{course?.course_code || enrollment.course_id.slice(0, 8)}</span>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span>{t.dashboard.enrolled} {new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:min-w-56 shrink-0">
                        <div className="rounded-lg sm:rounded-xl bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-xs sm:shadow-sm ring-1 ring-slate-200 min-w-0">
                          <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-400 font-medium">{t.dashboard.paid}</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-semibold text-slate-800 truncate">{formatCurrency(enrollment.amount_paid || 0, currencyLabel)}</div>
                        </div>
                        <div className="rounded-lg sm:rounded-xl bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-xs sm:shadow-sm ring-1 ring-slate-200 min-w-0">
                          <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-400 font-medium">{t.dashboard.remaining}</div>
                          <div className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-semibold text-slate-800 truncate">{formatCurrency(remaining, currencyLabel)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6 min-w-0">
          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm min-w-0">
            <div className="border-b border-slate-100 px-3.5 py-3 sm:px-5 sm:py-4 md:px-6">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">{t.dashboard.paymentSummaryTitle}</h3>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">{t.dashboard.paymentSummarySubtitle}</p>
                </div>
                <Link href="/portal/payments" className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700">
                  {t.common.viewAll}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>

            <div className="p-3 sm:p-5 md:p-6">
              <div className="rounded-xl sm:rounded-2xl bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-3.5 sm:p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-w-0">
                <div className="mb-3.5 sm:mb-6 flex items-start justify-between gap-3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-[0.24em] text-slate-400 font-medium">{t.dashboard.cardBalanceTitle}</p>
                    <p className="mt-1 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight text-white truncate min-w-0">{enrollmentsLoading ? t.common.loading : formatCurrency(outstandingBalance, currencyLabel)}</p>
                  </div>
                  <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/10">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-orange-300" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 sm:px-3 sm:py-3 min-w-0">
                    <div className="text-[10px] sm:text-xs text-slate-400 truncate">{t.dashboard.cardCoursesTitle}</div>
                    <div className="mt-0.5 sm:mt-1 font-semibold text-white text-xs sm:text-sm truncate">{enrollmentsLoading ? '...' : enrolledCount}</div>
                  </div>
                  <div className="rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2.5 py-2 sm:px-3 sm:py-3 min-w-0">
                    <div className="text-[10px] sm:text-xs text-slate-400 truncate">{t.dashboard.cardCertsTitle}</div>
                    <div className="mt-0.5 sm:mt-1 font-semibold text-white text-xs sm:text-sm truncate">{countersLoading ? '...' : (counters?.certificatesCount || 0)}</div>
                  </div>
                </div>
                <p className="mt-2.5 sm:mt-4 text-[11px] sm:text-xs leading-relaxed text-slate-400">
                  {t.dashboard.disclaimerText}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm min-w-0">
            <div className="border-b border-slate-100 px-3.5 py-3 sm:px-5 sm:py-4 md:px-6">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900">{t.dashboard.recentNotifsTitle}</h3>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-none">{t.dashboard.recentNotifsSubtitle}</p>
                </div>
                <Link href="/portal/notifications" className="inline-flex shrink-0 items-center gap-1 text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700">
                  {t.common.viewAll}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Link>
              </div>
            </div>

            <div className="p-3 sm:p-5 md:p-6">
              {recentNotifications.length === 0 ? (
                <div className="rounded-xl sm:rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 sm:px-4 sm:py-10 text-center">
                  <Bell className="mx-auto mb-2 sm:mb-3 h-7 w-7 sm:h-9 sm:w-9 text-slate-300" />
                  <p className="text-xs sm:text-sm text-slate-400">{t.dashboard.noNotifications}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentNotifications.map((notification, index) => (
                    <div key={notification.id} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 p-2.5 sm:p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40 min-w-0">
                      <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                        <div className="mt-0.5 flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-2xl bg-white shadow-xs sm:shadow-sm ring-1 ring-slate-200">
                          <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-0.5 sm:mb-1 flex items-center gap-2">
                            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-slate-400">{t.dashboard.update} {index + 1}</span>
                          </div>
                          <p className="text-xs sm:text-sm leading-snug sm:leading-relaxed text-slate-700 break-words">{notification.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
