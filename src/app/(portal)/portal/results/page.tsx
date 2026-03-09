import { MOCK_RESULTS } from '@/lib/mock-data/results'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { FileText } from 'lucide-react'
import { GRADE_COLORS } from '@/lib/constants'

export default function PortalResultsPage() {
  const results = MOCK_RESULTS.filter(r => r.studentId === 's1' && r.isPublished)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Results</h1>
        <p className="text-stone-500 text-sm mt-1">Your published examination results</p>
      </div>

      {results.length === 0 ? (
        <EmptyState icon={FileText} title="No results published" description="Your results will appear here once published by the institute." />
      ) : (
        <div className="grid gap-4">
          {results.map(result => {
            const course = MOCK_COURSES.find(c => c.id === result.courseId)
            return (
              <div key={result.id} className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-800">{course?.name}</h3>
                    <p className="text-xs text-stone-400 mt-1">Exam date: {result.examDate ? formatDate(result.examDate) : '-'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${GRADE_COLORS[result.finalGrade] || 'bg-stone-100 text-stone-700'}`}>
                    {result.finalGrade}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-stone-400">Theory Score</p>
                    <p className="text-lg font-bold text-stone-800">{result.theoryScore ?? '-'}<span className="text-sm text-stone-400">/100</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Practical Score</p>
                    <p className="text-lg font-bold text-stone-800">{result.practicalScore ?? '-'}<span className="text-sm text-stone-400">/100</span></p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Published</p>
                    <p className="text-sm font-medium text-stone-600">{result.publishedAt ? formatDate(result.publishedAt) : '-'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
