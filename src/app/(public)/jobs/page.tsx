'use client'

import Link from 'next/link'
import { Briefcase, Calendar, LogIn, MapPin } from 'lucide-react'

import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { apiGetPublishedVacancies } from '@/lib/api/jobs'
import { formatDate } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function PublicJobsPage() {
  const { isAuthenticated } = useAuthStore()
  const { data, isLoading, error, refetch } = useApi(() => apiGetPublishedVacancies(), [])
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
          {!isAuthenticated && (
            <ScrollReveal>
              <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50/70 p-6 text-center shadow-sm">
                <h2 className="text-xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Browse Jobs Publicly, Sign In to Apply
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-sm text-stone-600">
                  Published vacancies are visible here for everyone. IITI students can sign in to view full portal details and apply directly.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                  <Link href="/login" className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                    <LogIn className="h-4 w-4" />
                    Sign In to Apply
                  </Link>
                  <Link href="/apply" className="rounded-lg border border-orange-300 px-5 py-2.5 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-100">
                    Become a Student
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          )}

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
                            href={isAuthenticated ? `/portal/jobs/${job.id}` : '/login'}
                            className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
                          >
                            {isAuthenticated ? 'View Details' : 'Sign In to Apply'}
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
