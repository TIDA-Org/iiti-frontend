'use client'

import { useState } from 'react'
import {
  apiGetCourses,
  apiGetEnrollments,
  apiGetStudents,
  apiUpdateEnrollmentStatus,
  CourseApiResponse,
  EnrollmentApiResponse,
  StudentApiResponse,
} from '@/lib/api'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { formatDate } from '@/lib/utils'
import { ClipboardList } from 'lucide-react'
import { toast } from 'sonner'

const statusLabel: Record<string, string> = {
  pending_payment: 'Pending Payment',
  active: 'Active',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
  on_hold: 'On Hold',
  payment_overdue: 'Payment Overdue',
  expelled: 'Expelled',
}

const statusColor: Record<string, string> = {
  pending_payment: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  withdrawn: 'bg-slate-100 text-slate-700',
  on_hold: 'bg-orange-100 text-orange-700',
  payment_overdue: 'bg-rose-100 text-rose-700',
  expelled: 'bg-red-100 text-red-700',
}

export default function AdminEnrollmentsPage() {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const { data, isLoading, error, refetch } = useApi<EnrollmentApiResponse[]>(
    () => apiGetEnrollments(),
    [],
  )
  const { data: studentsData } = useApi<{ items: StudentApiResponse[] }>(
    () => apiGetStudents(1, 1000),
    [],
  )
  const { data: coursesData } = useApi<CourseApiResponse[]>(
    () => apiGetCourses(),
    [],
  )

  const enrollments = data || []
  const students = studentsData?.items || []
  const courses = coursesData || []

  const studentNameById = new Map(students.map((student) => [student.id, student.full_name]))
  const courseNameById = new Map(courses.map((course) => [course.id, course.name]))

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await apiUpdateEnrollmentStatus(id, status)
      toast.success('Enrollment status updated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update enrollment status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle={data ? `${enrollments.length} enrollment records` : 'Loading...'}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {enrollments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No enrollments yet" description="No enrollment records are available right now." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Enrollment ID</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Course</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Plan</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Fee</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Paid</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs text-amber-600">{enrollment.id.slice(0, 8)}...</td>
                      <td className="px-5 py-3 text-slate-700">{studentNameById.get(enrollment.student_id) || enrollment.student_id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-slate-700">{courseNameById.get(enrollment.course_id) || enrollment.course_id.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-slate-700 capitalize">{enrollment.payment_plan}</td>
                      <td className="px-5 py-3 text-slate-700 font-mono">{enrollment.total_fee_at_enrollment.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-700 font-mono">{enrollment.amount_paid.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[enrollment.enrollment_status] || 'bg-slate-100 text-slate-700'}`}>
                          {statusLabel[enrollment.enrollment_status] || enrollment.enrollment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(enrollment.enrollment_date)}</td>
                      <td className="px-5 py-3">
                        <select
                          className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white"
                          value={enrollment.enrollment_status}
                          disabled={updatingId === enrollment.id}
                          onChange={(e) => handleStatusChange(enrollment.id, e.target.value)}
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="withdrawn">Withdrawn</option>
                          <option value="on_hold">On Hold</option>
                          <option value="payment_overdue">Payment Overdue</option>
                          <option value="expelled">Expelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
