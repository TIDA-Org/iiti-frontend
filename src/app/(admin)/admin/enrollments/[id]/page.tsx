'use client'

import { } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import Link from 'next/link'
import { ArrowLeft, ClipboardList } from 'lucide-react'

interface Props { params: { id: string } }

export default function AdminEnrollmentDetailPage({ params }: Props) {
  const { id } = params
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/enrollments" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="Enrollment Detail" subtitle={`ID: ${id}`} />
      </div>
      <EmptyState icon={ClipboardList} title="Not available" description="Enrollment details will be available once the enrollment API is connected." />
    </div>
  )
}
