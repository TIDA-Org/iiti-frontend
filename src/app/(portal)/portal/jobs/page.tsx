'use client'

import Link from 'next/link'
import { Briefcase, Calendar, CheckCircle2, Clock3, ExternalLink, MapPin } from 'lucide-react'

import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { apiGetMyApplications, apiGetPublishedVacancies } from '@/lib/api/jobs'
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

export default function PortalJobsPage() {
  const vacanciesApi = useApi(() => apiGetPublishedVacancies(), [])
  const myApplicationsApi = useApi(() => apiGetMyApplications(), [])

  const vacancies = vacanciesApi.data || []
  const myApplications = myApplicationsApi.data || []
  const appliedByVacancyId = new Map(myApplications.map((item) => [item.vacancy_id, item]))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Job Board
        </h1>
        <p className="mt-1 text-sm text-stone-500">Browse active vacancies and track your own applications.</p>
      </div>

      <DataLoader isLoading={vacanciesApi.isLoading || myApplicationsApi.isLoading} error={vacanciesApi.error || myApplicationsApi.error} onRetry={() => { vacanciesApi.refetch(); myApplicationsApi.refetch() }}>
        {vacancies.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No jobs available"
            description="Published job listings will appear here once vacancies are open for students."
          />
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              {vacancies.map((vacancy) => {
                const application = appliedByVacancyId.get(vacancy.id)
                return (
                  <div key={vacancy.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold text-stone-800">{vacancy.title}</h2>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            Open
                          </span>
                          {application && (
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${applicationStyles[application.status] || 'bg-slate-100 text-slate-700'}`}>
                              Applied · {application.status}
                            </span>
                          )}
                        </div>

                        <div className="text-sm font-medium text-orange-600">{vacancy.company_name}</div>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{vacancy.location || 'Location not specified'}</span>
                          {vacancy.application_deadline && (
                            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Deadline: {formatDate(vacancy.application_deadline)}</span>
                          )}
                          {vacancy.salary_range && <span>{vacancy.salary_range}</span>}
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-stone-600">
                          {stripHtml(vacancy.description)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                        <Link href={`/portal/jobs/${vacancy.id}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                          View Vacancy
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-stone-800">My Applications</h2>
              </div>

              {myApplications.length === 0 ? (
                <EmptyState
                  icon={Clock3}
                  title="No applications yet"
                  description="When you apply to a vacancy, your application status will appear here."
                  className="py-10"
                />
              ) : (
                <div className="space-y-3">
                  {myApplications.map((application) => (
                    <div key={application.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium text-stone-800">{application.vacancy_title || 'Vacancy'}</div>
                          <div className="mt-1 text-xs text-stone-500">Applied {formatDate(application.applied_at)}</div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${applicationStyles[application.status] || 'bg-slate-100 text-slate-700'}`}>
                          {application.status}
                        </span>
                      </div>
                      {application.student_message && (
                        <p className="mt-3 text-sm text-stone-600">{application.student_message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DataLoader>
    </div>
  )
}
