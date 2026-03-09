'use client'

import { useState } from 'react'
import { MOCK_VACANCIES } from '@/lib/mock-data/vacancies'
import { formatDate } from '@/lib/utils'
import { Briefcase, MapPin, DollarSign, Globe, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'

export default function PortalJobsPage() {
  const [applying, setApplying] = useState<string | null>(null)
  const jobs = MOCK_VACANCIES.filter(v => v.isPublished)

  const handleApply = async (jobId: string) => {
    setApplying(jobId)
    await delay(800)
    setApplying(null)
    toast.success('Application submitted successfully!')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Board</h1>
        <p className="text-stone-500 text-sm mt-1">{jobs.length} available positions</p>
      </div>

      <div className="grid gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-stone-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-stone-800">{job.title}</h3>
                  {job.isInternational && (
                    <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      <Globe className="w-3 h-3" /> International
                    </span>
                  )}
                </div>
                <p className="text-orange-600 font-medium text-sm mb-3">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500 mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                  {job.salaryRange && <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{job.salaryRange}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Deadline: {formatDate(job.deadline)}</span>
                </div>
                <p className="text-sm text-stone-600 line-clamp-2">{job.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.qualifications.slice(0, 3).map((q, i) => (
                    <span key={i} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">{q}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleApply(job.id)}
                disabled={applying === job.id}
                className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors"
              >
                {applying === job.id ? 'Applying...' : 'Apply'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
