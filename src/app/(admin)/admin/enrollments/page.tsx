'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BatchApiResponse,
  CourseApiResponse,
  apiGetBatches,
  apiGetCourses,
} from '@/lib/api/courses'
import {
  apiCreateEnrollment,
  apiCreateRetake,
  apiGetEnrollment,
  apiGetEnrollments,
  apiUpdateEnrollmentStatus,
  EnrollmentApiResponse,
  EnrollmentDetailApiResponse,
} from '@/lib/api/enrollments'
import { apiGetStudents, StudentApiResponse } from '@/lib/api/students'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { formatDate } from '@/lib/utils'
import { ClipboardList, Eye, Plus, RotateCcw, X } from 'lucide-react'
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

const formatLkr = (value: unknown): string => {
  const amount = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(amount)) return '-'
  return `LKR ${amount.toLocaleString()}`
}

export default function AdminEnrollmentsPage() {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createCourseId, setCreateCourseId] = useState('')
  const [createBatches, setCreateBatches] = useState<BatchApiResponse[]>([])
  const [loadingCreateBatches, setLoadingCreateBatches] = useState(false)

  const [detail, setDetail] = useState<EnrollmentDetailApiResponse | null>(null)
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null)

  const [retakeEnrollment, setRetakeEnrollment] = useState<EnrollmentApiResponse | null>(null)
  const [retakeCourseBatches, setRetakeCourseBatches] = useState<BatchApiResponse[]>([])
  const [loadingRetakeBatches, setLoadingRetakeBatches] = useState(false)
  const [creatingRetake, setCreatingRetake] = useState(false)
  const [students, setStudents] = useState<StudentApiResponse[]>([])
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [studentsError, setStudentsError] = useState<string | null>(null)
  const { hasPermission } = usePermissionAccess()

  const canCreateEnrollment = hasPermission('enrollments.create')
  const canEditEnrollment = hasPermission('enrollments.edit')

  const { data, isLoading, error, refetch } = useApi<EnrollmentApiResponse[]>(
    () => apiGetEnrollments(),
    [],
  )
  const { data: coursesData } = useApi<CourseApiResponse[]>(
    () => apiGetCourses(),
    [],
  )

  const enrollments = data || []
  const courses = coursesData || []

  const studentNameById = useMemo(() => new Map(students.map((student) => [student.id, student.full_name])), [students])
  const courseNameById = useMemo(() => new Map(courses.map((course) => [course.id, course.name])), [courses])

  useEffect(() => {
    const loadStudents = async () => {
      setStudentsLoading(true)
      setStudentsError(null)
      try {
        let page = 1
        const allStudents: StudentApiResponse[] = []

        while (true) {
          // Backend enforces per_page <= 100
          const response = await apiGetStudents(page, 100)
          allStudents.push(...response.items)

          if (page >= response.pages || response.items.length === 0) break
          page += 1
        }

        setStudents(allStudents)
      } catch (err) {
        setStudentsError(err instanceof Error ? err.message : 'Failed to load students')
        setStudents([])
      } finally {
        setStudentsLoading(false)
      }
    }

    loadStudents()
  }, [])

  useEffect(() => {
    if (!createCourseId) {
      setCreateBatches([])
      return
    }

    const loadBatches = async () => {
      setLoadingCreateBatches(true)
      try {
        const batches = await apiGetBatches(createCourseId)
        setCreateBatches(batches)
      } catch {
        setCreateBatches([])
      } finally {
        setLoadingCreateBatches(false)
      }
    }

    loadBatches()
  }, [createCourseId])

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

  const handleCreateEnrollment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const formData = new FormData(e.currentTarget)

    try {
      await apiCreateEnrollment({
        student_id: formData.get('student_id') as string,
        course_id: formData.get('course_id') as string,
        batch_id: (formData.get('batch_id') as string) || null,
        duration_option_id: (formData.get('duration_option_id') as string)
          ? Number(formData.get('duration_option_id'))
          : null,
        payment_plan: formData.get('payment_plan') as string,
        nvq_selected: formData.get('nvq_selected') === 'on',
        custom_fee: (formData.get('custom_fee') as string) ? Number(formData.get('custom_fee')) : null,
        notes: (formData.get('notes') as string) || null,
      })
      toast.success('Enrollment created successfully')
      setShowCreateForm(false)
      setCreateCourseId('')
      e.currentTarget.reset()
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create enrollment')
    } finally {
      setCreating(false)
    }
  }

  const handleViewDetail = async (id: string) => {
    setLoadingDetailId(id)
    try {
      const data = await apiGetEnrollment(id)
      setDetail(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load enrollment detail')
    } finally {
      setLoadingDetailId(null)
    }
  }

  const handleOpenRetake = async (enrollment: EnrollmentApiResponse) => {
    setRetakeEnrollment(enrollment)
    setLoadingRetakeBatches(true)
    try {
      const batches = await apiGetBatches(enrollment.course_id)
      setRetakeCourseBatches(batches)
    } catch {
      setRetakeCourseBatches([])
    } finally {
      setLoadingRetakeBatches(false)
    }
  }

  const handleCreateRetake = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!retakeEnrollment) return

    setCreatingRetake(true)
    const formData = new FormData(e.currentTarget)
    try {
      await apiCreateRetake(retakeEnrollment.id, {
        batch_id: (formData.get('batch_id') as string) || null,
        duration_option_id: (formData.get('duration_option_id') as string)
          ? Number(formData.get('duration_option_id'))
          : null,
        notes: (formData.get('notes') as string) || null,
      })
      toast.success('Retake enrollment created')
      setRetakeEnrollment(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create retake')
    } finally {
      setCreatingRetake(false)
    }
  }

  const selectedCreateCourse = courses.find((course) => course.id === createCourseId)

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle={data ? `${enrollments.length} enrollment records` : 'Loading...'}
        actions={
          canCreateEnrollment ? (
            <button
              onClick={() => setShowCreateForm((v) => !v)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreateForm ? 'Cancel' : 'New Enrollment'}
            </button>
          ) : null
        }
      />

      {canCreateEnrollment && showCreateForm && (
        <form onSubmit={handleCreateEnrollment} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Create Enrollment</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Student *</label>
              <select name="student_id" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={studentsLoading || students.length === 0}>
                <option value="">{studentsLoading ? 'Loading students...' : 'Select student'}</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.full_name}</option>
                ))}
              </select>
              {studentsError && <p className="text-red-500 text-xs mt-1">{studentsError}</p>}
              {!studentsLoading && !studentsError && students.length === 0 && (
                <p className="text-slate-400 text-xs mt-1">No registered students found.</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course *</label>
              <select
                name="course_id"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                onChange={(e) => setCreateCourseId(e.target.value)}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Batch</label>
              <select name="batch_id" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={!createCourseId || loadingCreateBatches}>
                <option value="">{loadingCreateBatches ? 'Loading...' : 'Select batch'}</option>
                {createBatches.map((batch) => (
                  <option key={batch.id} value={batch.id}>{batch.batch_code}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Duration Option</label>
              <select name="duration_option_id" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={!createCourseId}>
                <option value="">Select duration</option>
                {(selectedCreateCourse?.duration_options || []).map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label || `${option.duration_value} ${option.duration_unit}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Payment Plan *</label>
              <select name="payment_plan" defaultValue="full" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="full">Full</option>
                <option value="installment">Installment</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Custom Fee</label>
              <input name="custom_fee" type="number" min={0} step="0.01" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input name="nvq_selected" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                NVQ selected
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
              <textarea name="notes" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Enrollment'}
            </button>
          </div>
        </form>
      )}

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
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(enrollment.id)}
                            disabled={loadingDetailId === enrollment.id}
                            className="text-slate-500 hover:text-slate-700"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canCreateEnrollment && (
                            <button
                              onClick={() => handleOpenRetake(enrollment)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Create retake"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          {canEditEnrollment && (
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
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataLoader>
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Enrollment Detail</h3>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-5 grid sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Student:</span> <span className="text-slate-700">{studentNameById.get(detail.student_id) || detail.student_id}</span></div>
              <div><span className="text-slate-400">Course:</span> <span className="text-slate-700">{courseNameById.get(detail.course_id) || detail.course_id}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className="text-slate-700">{statusLabel[detail.enrollment_status] || detail.enrollment_status}</span></div>
              <div><span className="text-slate-400">Payment Plan:</span> <span className="text-slate-700 capitalize">{detail.payment_plan}</span></div>
              <div><span className="text-slate-400">Enrollment Date:</span> <span className="text-slate-700">{formatDate(detail.enrollment_date)}</span></div>
              <div><span className="text-slate-400">Amount Paid:</span> <span className="text-slate-700">{formatLkr(detail.amount_paid)}</span></div>
              <div><span className="text-slate-400">Total Fee:</span> <span className="text-slate-700">{formatLkr(detail.total_fee_at_enrollment)}</span></div>
              <div><span className="text-slate-400">Retake:</span> <span className="text-slate-700">{detail.is_retake ? 'Yes' : 'No'}</span></div>
              {detail.fee_breakdown && (
                <div className="sm:col-span-2 bg-slate-50 border border-slate-100 rounded-lg p-3">
                  <p className="font-medium text-slate-700 mb-2">Fee Breakdown</p>
                  <div className="grid sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center justify-between rounded-md bg-white border border-slate-100 px-3 py-2">
                      <span className="text-slate-500">Base Course Fee</span>
                      <span className="font-medium text-slate-700">{formatLkr((detail.fee_breakdown as Record<string, unknown>).base_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white border border-slate-100 px-3 py-2">
                      <span className="text-slate-500">NVQ Fee</span>
                      <span className="font-medium text-slate-700">{formatLkr((detail.fee_breakdown as Record<string, unknown>).nvq_fee)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-white border border-slate-100 px-3 py-2 sm:col-span-2">
                      <span className="text-slate-500">Trial Course</span>
                      <span className="font-medium text-slate-700">{(detail.fee_breakdown as Record<string, unknown>).is_trial ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-md bg-amber-50 border border-amber-100 px-3 py-2 sm:col-span-2">
                      <span className="text-amber-700 font-medium">Total Payable</span>
                      <span className="font-semibold text-amber-700">{formatLkr((detail.fee_breakdown as Record<string, unknown>).total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {retakeEnrollment && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg border border-slate-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Create Retake</h3>
              <button onClick={() => setRetakeEnrollment(null)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreateRetake} className="p-5 space-y-4">
              <p className="text-sm text-slate-500">Retake for {studentNameById.get(retakeEnrollment.student_id) || retakeEnrollment.student_id.slice(0, 8)} in {courseNameById.get(retakeEnrollment.course_id) || retakeEnrollment.course_id.slice(0, 8)}.</p>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Batch</label>
                <select name="batch_id" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" disabled={loadingRetakeBatches}>
                  <option value="">{loadingRetakeBatches ? 'Loading...' : 'Select batch'}</option>
                  {retakeCourseBatches.map((batch) => (
                    <option key={batch.id} value={batch.id}>{batch.batch_code}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Duration Option ID</label>
                <input name="duration_option_id" type="number" min={1} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                <textarea name="notes" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={creatingRetake} className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                  {creatingRetake ? 'Creating...' : 'Create Retake'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
