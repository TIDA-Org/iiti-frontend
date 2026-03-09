import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props { params: { id: string } }

export default function AdminEnrollmentDetailPage({ params }: Props) {
  const enrollment = MOCK_ENROLLMENTS.find(e => e.id === params.id)
  if (!enrollment) notFound()

  const student = MOCK_STUDENTS.find(s => s.id === enrollment.studentId)
  const course = MOCK_COURSES.find(c => c.id === enrollment.courseId)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/enrollments" className="text-slate-400 hover:text-slate-600"><ArrowLeft className="w-5 h-5" /></Link>
        <PageHeader title="Enrollment Detail" subtitle={`ID: ${enrollment.id}`} />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Student', value: student?.fullName || '-' },
            { label: 'Student ID', value: student?.studentId || '-' },
            { label: 'Course', value: course?.name || '-' },
            { label: 'Enrolled On', value: formatDate(enrollment.enrolledAt) },
            { label: 'Payment Plan', value: enrollment.paymentPlan },
            { label: 'Status', value: enrollment.status },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-400 mb-1">{item.label}</p>
              {item.label === 'Status' ? <StatusBadge status={item.value} /> : <p className="font-medium text-slate-700 text-sm">{item.value}</p>}
            </div>
          ))}
        </div>
        {enrollment.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">Approve Enrollment</button>
            <button className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2.5 rounded-lg font-semibold text-sm transition-colors border border-red-200">Reject</button>
          </div>
        )}
      </div>
    </div>
  )
}
