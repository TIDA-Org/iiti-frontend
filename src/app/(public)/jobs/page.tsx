'use client'

import { useAuthStore } from '@/store/authStore'
import { VACANCIES } from '@/lib/data/vacancies'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { LogIn, Briefcase, MapPin, Globe, Calendar } from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

export default function PublicJobsPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <h1 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Opportunities</h1>
          <p className="text-stone-400 max-w-xl mx-auto">IITI connects graduates with leading employers locally and internationally.</p>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          {!isAuthenticated ? (
            <ScrollReveal>
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Briefcase className="w-8 h-8 text-orange-500" />
                </div>
                <h2 className="text-2xl font-bold text-stone-800 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>Exclusive for IITI Students</h2>
                <p className="text-stone-500 mb-8 max-w-md mx-auto">
                  This section is available to registered IITI students only. Log in to view all available job vacancies and apply directly.
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-lg font-semibold transition-colors">
                  <LogIn className="w-4 h-4" /> Sign In to View Jobs
                </Link>
                <p className="mt-4 text-sm text-stone-400">
                  Not a student yet? <Link href="/apply" className="text-orange-500 hover:text-orange-600 font-medium">Apply for a course</Link>
                </p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid gap-4">
              {VACANCIES.filter(v => v.isPublished).map((job) => (
                <ScrollReveal key={job.id}>
                  <div className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-stone-800">{job.title}</h3>
                          {job.isInternational && <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"><Globe className="w-3 h-3" />{job.country}</span>}
                        </div>
                        <p className="text-orange-600 font-medium text-sm">{job.company}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-stone-400 mt-2">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {formatDate(job.deadline)}</span>
                        </div>
                      </div>
                      <Link href="/portal/jobs" className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
