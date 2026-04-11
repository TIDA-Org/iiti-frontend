'use client'

import { useState } from 'react'
import {
  apiGetResults,
  apiPublishResult,
  ResultApiResponse,
  ResultListApiResponse,
} from '@/lib/api/results'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { GRADE_COLORS } from '@/lib/constants'
import { toast } from 'sonner'

export default function AdminResultsPage() {
  const [publishing, setPublishing] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useApi<ResultListApiResponse>(
    () => apiGetResults(1, 100),
    [],
  )

  const results = data?.items || []
  const published = results.filter(r => r.is_published).length
  const unpublished = results.filter(r => !r.is_published).length

  const handlePublish = async (id: string) => {
    setPublishing(id)
    try {
      await apiPublishResult(id)
      toast.success('Result published successfully!')
      refetch()
    } catch {
      toast.error('Failed to publish result')
    } finally {
      setPublishing(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle={data ? `${published} published, ${unpublished} pending` : 'Loading...'}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Theory</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Practical</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Grade</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Score %</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {results.map((r: ResultApiResponse) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-amber-600">{r.student_id.slice(0, 8)}...</td>
                    <td className="px-5 py-3 text-slate-700 font-mono">{r.theory_score ?? '-'}</td>
                    <td className="px-5 py-3 text-slate-700 font-mono">{r.practical_score ?? '-'}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_COLORS[r.final_grade as keyof typeof GRADE_COLORS] || 'bg-stone-100'}`}>{r.final_grade}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 font-mono">{r.score_percentage != null ? `${r.score_percentage}%` : '-'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.is_published ? 'published' : 'pending'} />
                    </td>
                    <td className="px-5 py-3">
                      {!r.is_published ? (
                        <button
                          onClick={() => handlePublish(r.id)}
                          disabled={publishing === r.id}
                          className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                          {publishing === r.id ? '...' : 'Publish'}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">{r.published_at ? formatDate(r.published_at) : 'Published'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No results found.</div>
            )}
          </div>
        </DataLoader>
      </div>
    </div>
  )
}
