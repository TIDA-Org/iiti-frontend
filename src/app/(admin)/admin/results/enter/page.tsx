'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Search, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SearchInput } from '@/components/shared/SearchInput'
import { Textarea } from '@/components/ui/textarea'
import { apiCreateResult, apiPublishResult, apiUpdateResult, type ResultApiResponse } from '@/lib/api/results'
import { apiGetEnrollments, type EnrollmentApiResponse } from '@/lib/api/enrollments'
import { apiGetCourses, type CourseApiResponse } from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'

function toNumber(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return Number.NaN
  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function isPublishedResult(result: ResultApiResponse) {
  const status = (result.result_status || '').toLowerCase()
  return Boolean(result.is_published) || Boolean(result.published_at) || status.includes('publish')
}

function getEnrollmentResultState(result?: ResultApiResponse | null) {
  if (!result) return 'new'
  return isPublishedResult(result) ? 'published' : 'draft'
}

export default function ResultEntryPage() {
  const [search, setSearch] = useState('')
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('')
  const [theoryScore, setTheoryScore] = useState('')
  const [practicalScore, setPracticalScore] = useState('')
  const [remarks, setRemarks] = useState('')
  const [remarksSi, setRemarksSi] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const {
    data: enrollmentsData,
    isLoading: isEnrollmentsLoading,
    error: enrollmentsError,
    refetch: refetchEnrollments,
  } = useApi<EnrollmentApiResponse[]>(
    () => apiGetEnrollments(),
    [],
  )

  const {
    data: coursesData,
    isLoading: isCoursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useApi<CourseApiResponse[]>(
    () => apiGetCourses(),
    [],
  )

  const enrollments = useMemo(() => enrollmentsData || [], [enrollmentsData])

  const coursesById = useMemo<Record<string, CourseApiResponse>>(() => {
    const items = coursesData || []
    return Object.fromEntries(items.map((course) => [course.id, course]))
  }, [coursesData])

  const selectedEnrollment = useMemo<EnrollmentApiResponse | null>(() => {
    return enrollments.find((enrollment) => enrollment.id === selectedEnrollmentId) || null
  }, [enrollments, selectedEnrollmentId])

  const enrollmentResult = selectedEnrollment?.result || null

  const latestResult = useMemo<ResultApiResponse | null>(() => {
    return enrollmentResult || null
  }, [enrollmentResult])

  const editableResult = enrollmentResult && !isPublishedResult(enrollmentResult) ? enrollmentResult : null
  const visibleResult = enrollmentResult || null
  const isResultLocked = Boolean(enrollmentResult && isPublishedResult(enrollmentResult))

  const selectedStudent = selectedEnrollment?.student || null

  const isLoading = isEnrollmentsLoading || isCoursesLoading
  const error = enrollmentsError || coursesError

  const refetch = async () => {
    await Promise.all([refetchEnrollments(), refetchCourses()])
  }

  useEffect(() => {
    if (!selectedEnrollment) {
      setTheoryScore('')
      setPracticalScore('')
      setRemarks('')
      setRemarksSi('')
      return
    }

    if (visibleResult) {
      setTheoryScore(visibleResult.theory_score?.toString() || '')
      setPracticalScore(visibleResult.practical_score?.toString() || '')
      setRemarks(visibleResult.remarks || '')
      setRemarksSi(visibleResult.remarks_si || '')
      return
    }

    setTheoryScore('')
    setPracticalScore('')
    setRemarks('')
    setRemarksSi('')
  }, [selectedEnrollment, visibleResult])

  const filteredEnrollments = useMemo(() => {
    if (!search.trim()) return enrollments
    const query = search.toLowerCase()
    return enrollments.filter((enrollment) =>
      enrollment.id.toLowerCase().includes(query) ||
      enrollment.enrollment_number.toLowerCase().includes(query) ||
      coursesById[enrollment.course_id]?.name?.toLowerCase().includes(query) ||
      enrollment.student?.student_number?.toLowerCase().includes(query) ||
      enrollment.student?.full_name?.toLowerCase().includes(query) ||
      enrollment.student?.nic_number?.toLowerCase().includes(query)
    )
  }, [coursesById, enrollments, search])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedEnrollment) {
      toast.error('Select an enrollment first')
      return
    }

    if (isResultLocked) {
      toast.error('This result is already published and cannot be edited')
      return
    }

    const theory = toNumber(theoryScore)
    const practical = toNumber(practicalScore)

    if (Number.isNaN(theory)) {
      toast.error('Theory score is required and must be a valid number')
      return
    }

    if (Number.isNaN(practical)) {
      toast.error('Practical score is required and must be a valid number')
      return
    }

    if (theory < 0 || theory > 100) {
      toast.error('Theory score must be between 0 and 100')
      return
    }

    if (practical < 0 || practical > 100) {
      toast.error('Practical score must be between 0 and 100')
      return
    }

    setSaving(true)
    try {
      const payload = {
        enrollment_id: selectedEnrollment.id,
        theory_score: theory,
        practical_score: practical,
        remarks: remarks.trim() || '',
        remarks_si: remarksSi.trim() || '',
      }

      if (editableResult) {
        await apiUpdateResult(editableResult.id, payload)
        toast.success('Result updated successfully')
      } else {
        await apiCreateResult(payload)
        toast.success('Result created successfully')
      }

      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : editableResult ? 'Failed to update result' : 'Failed to create result')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish() {
    if (!editableResult) {
      toast.error('There is no unpublished result to publish')
      return
    }

    setPublishing(true)
    try {
      await apiPublishResult(editableResult.id)
      toast.success('Result published successfully')
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish result')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <Link href="/admin/results" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader
          title="Result Entry"
          className="mb-0 flex-1"
          actions={
            <Link
              href="/admin/results"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <Search className="w-3.5 h-3.5" />
              Browse Results
            </Link>
          }
        />
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
        {enrollments.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No enrollments available"
            description="Create enrollments before entering results."
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-slate-800">Selected Enrollment</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedEnrollment
                        ? isResultLocked
                          ? 'A published result already exists for this enrollment.'
                          : editableResult
                            ? 'An unpublished result is ready to edit.'
                            : 'Ready to create a result for the selected enrollment.'
                        : 'Choose an enrollment from the list to begin.'}
                    </p>
                  </div>
                  {selectedEnrollment && (
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isResultLocked ? 'bg-slate-100 text-slate-500' : editableResult ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isResultLocked ? 'Published' : editableResult ? 'Draft' : 'New'}
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Enrollment No.</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{selectedEnrollment?.enrollment_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Student Name</p>
                    <p className="mt-1 text-sm text-slate-700">{selectedStudent?.full_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">NIC</p>
                    <p className="mt-1 text-sm text-slate-700">{selectedStudent?.nic_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Payment Status</p>
                    <p className="mt-1 text-sm text-slate-700">{selectedEnrollment?.enrollment_status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Result Status</p>
                    <p className="mt-1 text-sm text-slate-700">{visibleResult ? (visibleResult.is_published ? 'Published' : 'Draft') : 'No result yet'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <SearchInput value={search} onChange={setSearch} placeholder="Search by enrollment number, student number, student name, NIC, or course name..." />
                </div>
                <div className="max-h-[28rem] divide-y divide-slate-100 overflow-y-auto">
                  {filteredEnrollments.map((enrollment) => {
                    const active = enrollment.id === selectedEnrollmentId
                    const student = enrollment.student
                    const course = coursesById[enrollment.course_id]
                    const rowResult = enrollment.result || null
                    const rowStatus = getEnrollmentResultState(rowResult)
                    return (
                      <button
                        key={enrollment.id}
                        type="button"
                        onClick={() => setSelectedEnrollmentId(enrollment.id)}
                        className={`w-full px-5 py-4 text-left transition-colors ${active ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {enrollment.enrollment_number}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {student?.full_name || 'Unknown student'} · NIC {student?.nic_number || '-'}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Payment {enrollment.enrollment_status} ·
                              Student {student?.student_number || '-'} · Course {course?.name || 'Unknown course'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${rowStatus === 'draft' ? 'bg-amber-100 text-amber-700' : rowStatus === 'published' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                              {rowStatus === 'draft' ? 'Draft' : rowStatus === 'published' ? 'Published' : 'New'}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                  {filteredEnrollments.length === 0 && (
                    <div className="px-5 py-10 text-center text-sm text-slate-400">No enrollments match your search.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-base font-semibold text-slate-800">Enter Result</h3>
                  <p className="text-xs text-slate-400">Values should stay between 0 and 100.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Theory Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={theoryScore}
                      onChange={(event) => setTheoryScore(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-50"
                      placeholder="Enter theory score"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">Practical Score</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={practicalScore}
                      onChange={(event) => setPracticalScore(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-50"
                      placeholder="Enter practical score"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Remarks</label>
                  <Textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    rows={4}
                    placeholder="English remarks"
                    className="rounded-lg border-slate-200 text-sm focus-visible:border-amber-400 focus-visible:ring-amber-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Remarks (Sinhala)</label>
                  <Textarea
                    value={remarksSi}
                    onChange={(event) => setRemarksSi(event.target.value)}
                    rows={4}
                    placeholder="සිංහල සටහන්"
                    className="rounded-lg border-slate-200 text-sm focus-visible:border-amber-400 focus-visible:ring-amber-100"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  {editableResult && !isResultLocked && (
                    <button
                      type="button"
                      onClick={handlePublish}
                      disabled={publishing || saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {publishing ? 'Publishing...' : 'Publish Result'}
                    </button>
                  )}
                  <Link
                    href="/admin/results"
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-800"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={!selectedEnrollment || saving || publishing || isResultLocked}
                    className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : isResultLocked ? 'Result Published' : editableResult ? 'Update Result' : 'Create Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DataLoader>
    </div>
  )
}
