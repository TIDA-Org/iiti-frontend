'use client'

import { useEffect, useState } from 'react'
import { BriefcaseBusiness } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import {
  JobApplicationApiResponse,
  apiGetAdminApplications,
  apiGetAdminVacancies,
  apiUpdateApplicationStatus,
} from '@/lib/api/jobs'
import { formatDate } from '@/lib/utils'

const applicationStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  forwarded: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function AdminJobApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [vacancyFilter, setVacancyFilter] = useState('all')
  const applicationsApi = useApi(() => apiGetAdminApplications(1, 100, vacancyFilter, statusFilter), [vacancyFilter, statusFilter])
  const vacanciesApi = useApi(() => apiGetAdminVacancies(1, 100), [])
  const [drafts, setDrafts] = useState<Record<string, { status: string; staff_notes: string }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    const nextDrafts: Record<string, { status: string; staff_notes: string }> = {}
    ;(applicationsApi.data?.items || []).forEach((application: JobApplicationApiResponse) => {
      nextDrafts[application.id] = {
        status: application.status,
        staff_notes: application.staff_notes || '',
      }
    })
    setDrafts(nextDrafts)
  }, [applicationsApi.data])

  async function handleSave(applicationId: string) {
    const draft = drafts[applicationId]
    if (!draft) {
      return
    }

    setSavingId(applicationId)
    try {
      await apiUpdateApplicationStatus(applicationId, {
        status: draft.status,
        staff_notes: draft.staff_notes || null,
      })
      toast.success('Application updated')
      await applicationsApi.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update application')
    } finally {
      setSavingId(null)
    }
  }

  const items = applicationsApi.data?.items || []
  const vacancies = vacanciesApi.data?.items || []

  return (
    <div>
      <PageHeader
        title="Job Applications"
        subtitle={applicationsApi.data ? `${applicationsApi.data.total} applications` : 'Loading applications...'}
        actions={
          <div className="flex items-center gap-3">
            <select value={vacancyFilter} onChange={(event) => setVacancyFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <option value="all">All vacancies</option>
              {vacancies.map((vacancy) => (
                <option key={vacancy.id} value={vacancy.id}>{vacancy.title}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="forwarded">Forwarded</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white">
        <DataLoader isLoading={applicationsApi.isLoading || vacanciesApi.isLoading} error={applicationsApi.error || vacanciesApi.error} onRetry={() => { applicationsApi.refetch(); vacanciesApi.refetch() }}>
          {items.length === 0 ? (
            <EmptyState icon={BriefcaseBusiness} title="No applications found" description="Applications will appear here once students start applying to published vacancies." className="py-12" />
          ) : (
            <div className="divide-y divide-slate-100">
              {items.map((application) => {
                const draft = drafts[application.id] || { status: application.status, staff_notes: application.staff_notes || '' }
                return (
                  <div key={application.id} className="px-5 py-5">
                    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{application.vacancy_title || 'Vacancy'}</h3>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${applicationStyles[application.status] || 'bg-slate-100 text-slate-700'}`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {application.student_name || 'Student'}
                          {application.student_number ? ` · ${application.student_number}` : ''}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Applied {formatDate(application.applied_at)}</p>

                        {application.student_message && (
                          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Student Message</div>
                            <p className="text-sm leading-relaxed text-slate-700">{application.student_message}</p>
                          </div>
                        )}
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="space-y-3">
                          <select
                            value={draft.status}
                            onChange={(event) => setDrafts((prev) => ({ ...prev, [application.id]: { ...draft, status: event.target.value } }))}
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="forwarded">Forwarded</option>
                            <option value="rejected">Rejected</option>
                          </select>

                          <textarea
                            value={draft.staff_notes}
                            onChange={(event) => setDrafts((prev) => ({ ...prev, [application.id]: { ...draft, staff_notes: event.target.value } }))}
                            rows={5}
                            placeholder="Internal staff notes"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          />

                          <button
                            onClick={() => handleSave(application.id)}
                            disabled={savingId === application.id}
                            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60"
                          >
                            {savingId === application.id ? 'Saving...' : 'Update Application'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
