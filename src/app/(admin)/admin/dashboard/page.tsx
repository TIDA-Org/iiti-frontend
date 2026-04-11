'use client'

import { Users, BookOpen, CreditCard, Award } from 'lucide-react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
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

  return (
    <div>

      <PageHeader
        title="Dashboard"
        subtitle="Overview of IITI operations and key performance indicators"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Total Students" value={totalStudents} icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50" />
        <KpiCard title="Results Recorded" value={totalResults} icon={BookOpen} iconColor="text-amber-500" iconBg="bg-amber-50" />
        <KpiCard title="Certificates Issued" value={totalCertificates} icon={Award} iconColor="text-purple-500" iconBg="bg-purple-50" />
        <KpiCard title="Active Operations" value="—" icon={CreditCard} iconColor="text-green-500" iconBg="bg-green-50" />
      </div>


      {/* Charts (Hidden for front_desk) */}
      {role !== 'front_desk' && (
        <>
          <div className="grid lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2">
              <RevenueChart />
            </div>
            {/* <CoursePopularityChart /> */}
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