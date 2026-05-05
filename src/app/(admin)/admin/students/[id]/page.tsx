'use client'

import { useMemo } from 'react'
import {
  apiGetGuarantors,
  apiGetStudent,
  apiGetStudentDocuments,
} from '@/lib/api/students'
import { apiGetEnrollments } from '@/lib/api/enrollments'
import { apiGetCourse, apiGetBatches } from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import {
  User,
  Phone,
  Mail,
  MapPin,
  Edit,
  ShieldCheck,
  FileText,
  Wallet,
  ClipboardList,
} from 'lucide-react'

interface Props { params: { id: string } }

function statusClass(status: string) {
  const key = status.toLowerCase()
  if (key === 'active' || key === 'completed') return 'bg-green-100 text-green-700'
  if (key === 'pending_payment' || key === 'payment_overdue' || key === 'on_hold') return 'bg-amber-100 text-amber-700'
  return 'bg-slate-100 text-slate-700'
}

function toLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function getEnrollmentRemaining(enrollment: {
  enrollment_status: string
  total_fee_at_enrollment?: number
  amount_paid?: number
}) {
  // Exclude completed and withdrawn enrollments from outstanding balance
  if (enrollment.enrollment_status === 'completed' || enrollment.enrollment_status === 'withdrawn') {
    return 0
  }
  return Math.max((enrollment.total_fee_at_enrollment || 0) - (enrollment.amount_paid || 0), 0)
}

export default function AdminStudentDetailPage({ params }: Props) {
  const { id } = params

  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
    refetch: refetchStudent,
  } = useApi(() => apiGetStudent(id), [id])

  const {
    data: enrollments,
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useApi(() => apiGetEnrollments(id), [id])

  const {
    data: guarantors,
    isLoading: guarantorsLoading,
    refetch: refetchGuarantors,
  } = useApi(() => apiGetGuarantors(id), [id])

  const {
    data: documents,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useApi(() => apiGetStudentDocuments(id), [id])

  const {
    data: relatedNames,
    refetch: refetchRelatedNames,
  } = useApi(
    async () => {
      const records = enrollments || []
      const courseIds = Array.from(new Set(records.map((item) => item.course_id)))
      const coursePairs = await Promise.allSettled(
        courseIds.map(async (courseId) => {
          const course = await apiGetCourse(courseId)
          return [courseId, course.name] as const
        }),
      )

      const batches = await apiGetBatches()
      const batchMap = new Map(batches.map((item) => [item.id, item.batch_code]))

      const courseMap = coursePairs.reduce<Record<string, string>>((acc, pair) => {
        if (pair.status === 'fulfilled') {
          const [courseId, courseName] = pair.value
          acc[courseId] = courseName
        }
        return acc
      }, {})

      return {
        courseMap,
        batchMap: Object.fromEntries(batchMap),
      }
    },
    [JSON.stringify((enrollments || []).map((item) => item.course_id).sort())],
  )

  const summary = useMemo(() => {
    const list = enrollments || []
    const total = list.length
    const active = list.filter((item) => item.enrollment_status === 'active').length
    const completed = list.filter((item) => item.enrollment_status === 'completed').length
    const due = list.reduce((sum, item) => sum + getEnrollmentRemaining(item), 0)
    const unverifiedDocs = (documents || []).filter((item) => !item.is_verified).length
    return { total, active, completed, due, unverifiedDocs }
  }, [documents, enrollments])

  const refreshAll = () => {
    refetchStudent()
    refetchEnrollments()
    refetchGuarantors()
    refetchDocuments()
    refetchRelatedNames()
  }

  return (
    <DataLoader isLoading={studentLoading} error={studentError} onRetry={refreshAll}>
      {student && (
        <div>
          <PageHeader
            title={student.full_name}
            subtitle={student.student_number}
            actions={
              <Link href={`/admin/students/${student.id}/edit`} className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                <Edit className="w-4 h-4" /> Edit
              </Link>
            }
          />

          <div className="grid xl:grid-cols-3 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-xl">{student.full_name[0]}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{student.full_name}</h3>
                    <p className="text-xs text-slate-500">{student.gender} · DOB {formatDate(student.date_of_birth)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{student.preferred_language.toUpperCase()}</span>
                  {student.is_doing_nvq && <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">NVQ</span>}
                  {student.nvq_eligible && <span className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700">NVQ Eligible</span>}
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { icon: User, label: 'NIC', value: student.nic_number },
                    { icon: Phone, label: 'Phone', value: student.phone_primary },
                    { icon: Mail, label: 'Email', value: student.email || '-' },
                    { icon: MapPin, label: 'Location', value: `${student.city}, ${student.district}` },
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex gap-3 items-start">
                        <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-400">{item.label}</p>
                          <p className="font-medium text-slate-700">{item.value}</p>
                        </div>
                      </div>
                    )
                  })}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-400">Registered on</p>
                    <p className="font-medium text-slate-700">{formatDate(student.created_at)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-3">Emergency Contact</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700 font-medium">{student.emergency_contact_name || '-'}</p>
                  <p className="text-slate-500">{student.emergency_contact_rel || '-'}</p>
                  <p className="text-slate-500">{student.emergency_contact_phone || '-'}</p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-2 space-y-6">
              <div className="grid md:grid-cols-5 gap-3">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Enrollments</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{enrollmentsLoading ? '...' : summary.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Active</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{enrollmentsLoading ? '...' : summary.active}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Documents Pending</p>
                  <p className="text-xl font-bold text-amber-700 mt-1">{documentsLoading ? '...' : summary.unverifiedDocs}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Outstanding</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">LKR {summary.due.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-xl font-bold text-blue-700 mt-1">{enrollmentsLoading ? '...' : summary.completed}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700 flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Enrollments</h3>
                </div>
                {enrollmentsLoading ? (
                  <p className="text-center py-6 text-slate-400 text-sm">Loading enrollments...</p>
                ) : (enrollments || []).length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm">No enrollment records found.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {(enrollments || []).map((enrollment) => {
                      const courseName = relatedNames?.courseMap?.[enrollment.course_id] || enrollment.course_id.slice(0, 8)
                      const batchCode = enrollment.batch_id ? (relatedNames?.batchMap?.[enrollment.batch_id] || enrollment.batch_id.slice(0, 8)) : '-'
                      const due = getEnrollmentRemaining(enrollment)
                      return (
                        <div key={enrollment.id} className="px-5 py-4 grid md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-400">Course</p>
                            <p className="font-medium text-slate-700">{courseName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Batch {batchCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Status</p>
                            <span className={`inline-flex mt-0.5 text-xs px-2 py-0.5 rounded ${statusClass(enrollment.enrollment_status)}`}>
                              {toLabel(enrollment.enrollment_status)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Financials</p>
                            <p className="text-slate-700">Paid: LKR {enrollment.amount_paid.toLocaleString()}</p>
                            {enrollment.enrollment_status === 'completed' || enrollment.enrollment_status === 'withdrawn' ? (
                              <p className="text-slate-500 text-xs italic">No outstanding balance</p>
                            ) : (
                              <p className="text-slate-700">Due: LKR {due.toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Enrolled</p>
                            <p className="text-slate-700">{formatDate(enrollment.enrollment_date)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Guarantors</h3>
                {guarantorsLoading ? (
                  <p className="text-sm text-slate-400">Loading guarantors...</p>
                ) : (guarantors || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No guarantors recorded.</p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-3">
                    {(guarantors || []).map((g) => (
                      <div key={g.id} className="rounded-lg border border-slate-200 p-3">
                        <p className="text-sm text-slate-700 font-medium">{g.full_name}</p>
                        <p className="text-xs text-slate-500 mt-1">{g.relationship_to || '-'}</p>
                        <p className="text-xs text-slate-500">{g.phone || '-'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><FileText className="w-4 h-4" /> Documents</h3>
                {documentsLoading ? (
                  <p className="text-sm text-slate-400">Loading documents...</p>
                ) : (documents || []).length === 0 ? (
                  <p className="text-sm text-slate-400">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(documents || []).map((d) => (
                      <div key={d.id} className="py-2 border-b border-slate-50 last:border-0 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-slate-600 capitalize">{d.doc_type.replace('_', ' ')}</p>
                          <p className="text-xs text-slate-400">{d.original_name || 'Uploaded'} · {formatDate(d.uploaded_at)}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${d.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {d.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Wallet className="w-4 h-4" /> Payments</h3>
                <div className="rounded-lg border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Outstanding Balance (from enrollments)</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">LKR {summary.due.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 mt-2">Dedicated payments endpoint is not yet implemented in backend.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DataLoader>
  )
}
