'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { apiApplyToVacancy, apiGetMyApplications, apiGetVacancy } from '@/lib/api/jobs'
import { formatDate } from '@/lib/utils'

const applicationStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  forwarded: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function PortalJobDetailPage() {
  const params = useParams<{ vacancyId: string }>()
  const vacancyId = Array.isArray(params.vacancyId) ? params.vacancyId[0] : params.vacancyId
  const [studentMessage, setStudentMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const vacancyApi = useApi(() => apiGetVacancy(vacancyId), [vacancyId])
  const applicationsApi = useApi(() => apiGetMyApplications(), [])

  const myApplication = useMemo(
    () => (applicationsApi.data || []).find((item) => item.vacancy_id === vacancyId) || null,
    [applicationsApi.data, vacancyId],
  )

  async function handleApply() {
    if (!vacancyApi.data || myApplication) {
      return
    }

    setSubmitting(true)
    try {
      await apiApplyToVacancy(vacancyId, { student_message: studentMessage || null })
      toast.success('Application submitted')
      setStudentMessage('')
      await applicationsApi.refetch()
      await vacancyApi.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/portal/jobs" className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700">
        <ArrowLeft className="h-4 w-4" />
        Back to job board
      </Link>

      <DataLoader isLoading={vacancyApi.isLoading || applicationsApi.isLoading} error={vacancyApi.error || applicationsApi.error} onRetry={() => { vacancyApi.refetch(); applicationsApi.refetch() }}>
        {!vacancyApi.data ? (
          <EmptyState icon={Briefcase} title="Vacancy not found" description="This job could not be loaded." />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-stone-800">{vacancyApi.data.title}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${vacancyApi.data.vacancy_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                  {vacancyApi.data.vacancy_status}
                </span>
              </div>

              <p className="mt-2 text-sm font-medium text-orange-600">{vacancyApi.data.company_name}</p>

              <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{vacancyApi.data.location || 'Location not specified'}</span>
                {vacancyApi.data.application_deadline && (
                  <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Deadline: {formatDate(vacancyApi.data.application_deadline)}</span>
                )}
              </div>

              {vacancyApi.data.salary_range && (
                <div className="mt-4 rounded-xl bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  Salary Range: {vacancyApi.data.salary_range}
                </div>
              )}

              <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">Description</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-stone-700">
                  {stripHtml(vacancyApi.data.description)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-800">Apply to This Vacancy</h2>

                {myApplication ? (
                  <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-emerald-800">You have already applied</div>
                        <div className="mt-1 text-xs text-emerald-700">Applied {formatDate(myApplication.applied_at)}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${applicationStyles[myApplication.status] || 'bg-white text-slate-700'}`}>
                        {myApplication.status}
                      </span>
                    </div>
                    {myApplication.student_message && (
                      <p className="mt-3 text-sm text-emerald-900/85">{myApplication.student_message}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-stone-600">
                      Add an optional message to support your application.
                    </p>
                    <textarea
                      value={studentMessage}
                      onChange={(event) => setStudentMessage(event.target.value)}
                      rows={6}
                      maxLength={1000}
                      placeholder="Why are you a good fit for this role?"
                      className="mt-4 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition-colors focus:border-orange-300"
                    />
                    <button
                      onClick={handleApply}
                      disabled={submitting || vacancyApi.data.vacancy_status !== 'active'}
                      className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-800">Vacancy Snapshot</h2>
                <div className="mt-4 space-y-3 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Status</span>
                    <span className="font-medium text-stone-800">{vacancyApi.data.vacancy_status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Applications</span>
                    <span className="font-medium text-stone-800">{vacancyApi.data.application_count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Published</span>
                    <span className="font-medium text-stone-800">{vacancyApi.data.is_published ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DataLoader>
    </div>
  )
}
