'use client'

import { Users, BookOpen, CreditCard, Award } from 'lucide-react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart'
import { EnrollmentTrendChart } from '@/components/admin/dashboard/EnrollmentTrendChart'
import { CoursePopularityChart } from '@/components/admin/dashboard/CoursePopularityChart'
import { RecentActivityFeed } from '@/components/admin/dashboard/RecentActivityFeed'
import { PendingApprovalsWidget } from '@/components/admin/dashboard/PendingApprovalsWidget'
import { UpcomingIntakesWidget } from '@/components/admin/dashboard/UpcomingIntakesWidget'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_CERTIFICATES } from '@/lib/mock-data/certificates'
import { formatLKR } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

export default function AdminDashboardPage() {

  const { user } = useAuthStore()
  const role = user?.role

  const totalStudents = MOCK_STUDENTS.length
  const activeEnrollments = MOCK_ENROLLMENTS.filter(e => e.status === 'active').length
  const pendingEnrollments = MOCK_ENROLLMENTS.filter(e => e.status === 'pending').length
  const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalCertificates = MOCK_CERTIFICATES.filter(c => !c.isRevoked).length

  return (
    <div>

      <PageHeader
        title="Dashboard"
        subtitle="Overview of IITI operations and key performance indicators"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Students" value={totalStudents} icon={Users} trend={{ value: 12, label: 'vs last month' }} iconColor="text-blue-500" iconBg="bg-blue-50" />
        <KpiCard title="Active Enrollments" value={activeEnrollments} subtitle={`${pendingEnrollments} pending approval`} icon={BookOpen} trend={{ value: 8, label: 'vs last month' }} iconColor="text-amber-500" iconBg="bg-amber-50" />
        <KpiCard title="Revenue (YTD)" value={formatLKR(totalRevenue)} icon={CreditCard} trend={{ value: 15, label: 'vs last year' }} iconColor="text-green-500" iconBg="bg-green-50" />
        <KpiCard title="Certificates Issued" value={totalCertificates} icon={Award} trend={{ value: 5, label: 'vs last month' }} iconColor="text-purple-500" iconBg="bg-purple-50" />
      </div>


      {/* Charts (Hidden for front_desk) */}
      {role !== 'front_desk' && (
        <>
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            <CoursePopularityChart />
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <EnrollmentTrendChart />
            <RecentActivityFeed />
          </div>
        </>
      )}


      {/* Widgets visible for all roles */}
      <div className="grid lg:grid-cols-2 gap-4">
        <PendingApprovalsWidget />
        <UpcomingIntakesWidget />
      </div>

    </div>
  )
}