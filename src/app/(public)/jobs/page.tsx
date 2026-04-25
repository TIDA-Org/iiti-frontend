'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Briefcase, Calendar, MapPin } from 'lucide-react'

import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageLoader } from '@/components/shared/PageLoader'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { apiGetPublishedVacancies } from '@/lib/api/jobs'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function PublicJobsPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.replace('/login?redirect=/jobs')
    }
  }, [_hasHydrated, isAuthenticated, router])

  const { data, isLoading, error, refetch } = useApi(() => apiGetPublishedVacancies(), [])

  if (!_hasHydrated || !isAuthenticated) {
    return <PageLoader />
  }
  const vacancies = data || []

  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 px-4 py-20 text-center">
        <ScrollReveal>
          <h1 className="mb-4 text-4xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Job Opportunities
          </h1>
          <p className="mx-auto max-w-xl text-stone-400">
            IITI connects graduates with leading employers locally and internationally through active vacancy listings.
          </p>
        </ScrollReveal>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
            {vacancies.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No published vacancies"
                description="Open job opportunities will appear here once they are published by the admin team."
              />
            ) : (
              <div className="grid gap-4">
                {vacancies.map((job) => (
                  <ScrollReveal key={job.id}>
                    <div className="rounded-xl border border-stone-200 bg-white p-6 transition-shadow hover:shadow-md">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-stone-800">{job.title}</h3>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              {job.vacancy_status}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-orange-600">{job.company_name}</p>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-stone-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location || 'Location not specified'}
                            </span>
                            {job.application_deadline && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Deadline: {formatDate(job.application_deadline)}
                              </span>
                            )}
                          </div>
                          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-stone-600">
                            {stripHtml(job.description)}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                          {job.salary_range && <div className="text-sm font-semibold text-slate-700">{job.salary_range}</div>}
                          <Link
                            href={`/portal/jobs/${job.id}`}
                            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </DataLoader>
        </div>
      </section>
    </div>
  )
}
