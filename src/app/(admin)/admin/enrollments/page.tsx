'use client'

import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ClipboardList } from 'lucide-react'

export default function AdminEnrollmentsPage() {
  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="All enrollment records"
      />
      <EmptyState icon={ClipboardList} title="No enrollments yet" description="Enrollment records will appear here when the enrollment API is connected." />
    </div>
  )
}
