'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_VACANCIES } from '@/lib/mock-data/vacancies'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Plus, Eye, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'

export default function AdminVacanciesPage() {
  const [vacancies, setVacancies] = useState(MOCK_VACANCIES)

  const togglePublish = async (id: string) => {
    await delay(400)
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, isPublished: !v.isPublished } : v))
    toast.success('Vacancy status updated')
  }

  return (
    <div>
      <PageHeader
        title="Job Vacancies"
        subtitle={`${vacancies.filter(v => v.isPublished).length} active listings`}
        actions={
          <Link href="/admin/vacancies/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Vacancy
          </Link>
        }
      />

      <div className="grid gap-4">
        {vacancies.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800">{v.title}</h3>
                  {v.isInternational && <span className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full"><Globe className="w-3 h-3" />{v.country}</span>}
                </div>
                <p className="text-sm text-amber-600 font-medium mb-1">{v.company}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                  <span>{v.location}</span>
                  {v.salaryRange && <span>{v.salaryRange}</span>}
                  <span>Deadline: {formatDate(v.deadline)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={v.isPublished ? 'active' : 'inactive'} />
                <button
                  onClick={() => togglePublish(v.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${v.isPublished ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {v.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href={`/admin/vacancies/${v.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium border border-amber-200 px-3 py-1.5 rounded-lg">
                  <Eye className="w-3.5 h-3.5" /> View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
