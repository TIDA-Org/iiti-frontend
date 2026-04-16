'use client'

import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CreditCard,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { EnrollmentTrendChart } from '@/components/admin/dashboard/EnrollmentTrendChart'
import { RecentActivityFeed } from '@/components/admin/dashboard/RecentActivityFeed'
import { PendingApprovalsWidget } from '@/components/admin/dashboard/PendingApprovalsWidget'
import { UpcomingIntakesWidget } from '@/components/admin/dashboard/UpcomingIntakesWidget'
import { apiGetStudents } from '@/lib/api/students'
import { apiGetResults } from '@/lib/api/results'
import { apiGetCertificates } from '@/lib/api/certificates'
import { useApi } from '@/hooks/useApi'
import { useAuthStore } from '@/store/authStore'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const role = user?.role

  const { data: studentsData } = useApi(() => apiGetStudents(1, 1), [])
  const { data: resultsData } = useApi(() => apiGetResults(1, 1), [])
  const { data: certsData } = useApi(() => apiGetCertificates(1, 1), [])

  const totalStudents = studentsData?.total ?? 0
  const totalResults = resultsData?.total ?? 0
  const totalCertificates = certsData?.total ?? 0
  const activeOperations = role === 'front_desk' ? 'Core' : 'Full'

  const summaryCards = [
    {
      label: 'Total Students',
      value: totalStudents,
      href: '/admin/students',
      icon: Users,
      iconColor: 'text-sky-600',
      iconBg: 'bg-sky-100',
      accent: 'from-sky-500/15 to-blue-500/5',
      helper: 'Registered students in the system',
    },
    {
      label: 'Results Recorded',
      value: totalResults,
      href: '/admin/results',
      icon: BookOpen,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      accent: 'from-amber-500/15 to-yellow-500/5',
      helper: 'Published result records',
    },
    {
      label: 'Certificates Issued',
      value: totalCertificates,
      href: '/admin/certificates',
      icon: Award,
      iconColor: 'text-fuchsia-600',
      iconBg: 'bg-fuchsia-100',
      accent: 'from-fuchsia-500/15 to-purple-500/5',
      helper: 'Issued certificate records',
    },
    {
      label: 'Active Operations',
      value: activeOperations,
      href: '/admin/vacancies',
      icon: CreditCard,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      accent: 'from-emerald-500/15 to-green-500/5',
      helper: role === 'front_desk' ? 'Front desk workspace' : 'Admin workspace enabled',
    },
  ]

  const quickLinks = [
    { label: 'Manage Students', href: '/admin/students' },
    { label: 'Review Results', href: '/admin/results' },
    { label: 'Open Vacancies', href: '/admin/vacancies' },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-sky-200/60 bg-linear-to-br from-slate-900 via-slate-800 to-sky-900 px-5 py-6 text-white shadow-[0_30px_70px_-35px_rgba(15,23,42,0.9)] md:px-8 md:py-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-cyan-300/10 to-transparent" />
        <div className="absolute -right-12 top-8 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-cyan-300/10 blur-2xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-100 backdrop-blur-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Workspace
            </div>
            <p className="text-sm text-sky-100/80">Overview of IITI operations and key performance indicators</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
              Monitor student growth, published results, certificate issuance, and operational activity from one control surface.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-medium text-slate-200">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Signed in as {user?.name || 'Administrator'}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-2xl border border-white/15 bg-white/8 px-4 py-3 backdrop-blur-sm transition-all duration-200 hover:bg-white/12"
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

      {role !== 'front_desk' && (
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Revenue Overview</h3>
                  <p className="mt-1 text-sm text-slate-500">Monthly revenue trend across the current year.</p>
                </div>
                <Link href="/admin/payments" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800">
                  View payments
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-2 md:p-3">
              <RevenueChart />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
                  <p className="mt-1 text-sm text-slate-500">Latest operations recorded across the institute.</p>
                </div>
                <Link href="/admin/students" className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:text-sky-800">
                  Open students
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="p-2 md:p-3">
              <RecentActivityFeed />
            </div>
          </div>
        </section>
      )}

      {role !== 'front_desk' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <h3 className="text-lg font-semibold text-slate-900">Enrollment Trend</h3>
              <p className="mt-1 text-sm text-slate-500">Monthly student enrollment pattern for the latest year.</p>
            </div>
            <div className="p-2 md:p-3">
              <EnrollmentTrendChart />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h3 className="text-lg font-semibold text-slate-900">Pending Approvals</h3>
                <p className="mt-1 text-sm text-slate-500">Approvals and review actions requiring attention.</p>
              </div>
              <div className="p-2 md:p-3">
                <PendingApprovalsWidget />
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4 md:px-6">
                <h3 className="text-lg font-semibold text-slate-900">Upcoming Intakes</h3>
                <p className="mt-1 text-sm text-slate-500">Next scheduled training intakes and capacity planning.</p>
              </div>
              <div className="p-2 md:p-3">
                <UpcomingIntakesWidget />
              </div>
            </div>
          </div>
        </section>
      )}

      {role === 'front_desk' && (
        <section className="grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <h3 className="text-lg font-semibold text-slate-900">Pending Approvals</h3>
              <p className="mt-1 text-sm text-slate-500">Approvals and review actions requiring attention.</p>
            </div>
            <div className="p-2 md:p-3">
              <PendingApprovalsWidget />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 md:px-6">
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Intakes</h3>
              <p className="mt-1 text-sm text-slate-500">Next scheduled training intakes and capacity planning.</p>
            </div>
            <div className="p-2 md:p-3">
              <UpcomingIntakesWidget />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}