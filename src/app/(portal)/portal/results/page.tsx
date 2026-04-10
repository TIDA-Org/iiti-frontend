'use client'

import { useEffect, useState } from 'react'
import { apiGetMyResults, ResultApiResponse } from '@/lib/api'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText } from 'lucide-react'
import { GRADE_COLORS } from '@/lib/constants'

export default function PortalResultsPage() {
  const [results, setResults] = useState<ResultApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResults = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetMyResults(1, 100)
      setResults(data.items.filter(r => r.is_published))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load results')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchResults() }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Results</h1>
        <p className="text-stone-500 text-sm mt-1">Your published examination results</p>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={fetchResults}>
        {results.length === 0 ? (
          <EmptyState icon={FileText} title="No results published" description="Your results will appear here once published by the institute." />
        ) : (
          <div className="grid gap-4">
            {results.map(result => (
              <div key={result.id} className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-800">Course {result.course_id}</h3>
                    <p className="text-xs text-stone-400 mt-1">Status: {result.result_status || '-'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${(result.final_grade && GRADE_COLORS[result.final_grade]) || 'bg-stone-100 text-stone-700'}`}>
                    {result.final_grade || '-'}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-stone-400">Theory Score</p>
                    <p className="text-lg font-bold text-stone-800">{result.theory_score ?? '-'}<span className="text-sm text-stone-400">/100</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Practical Score</p>
                    <p className="text-lg font-bold text-stone-800">{result.practical_score ?? '-'}<span className="text-sm text-stone-400">/100</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Published</p>
                    <p className="text-sm font-medium text-stone-600">{result.published_at ? formatDate(result.published_at) : '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DataLoader>
    </div>
  )
}
