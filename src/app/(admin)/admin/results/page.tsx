'use client'

import { useState } from 'react'
import { MOCK_RESULTS } from '@/lib/mock-data/results'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { GRADE_COLORS } from '@/lib/constants'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'
import Link from 'next/link'

export default function AdminResultsPage() {
  const [publishing, setPublishing] = useState<string | null>(null)

  const enriched = MOCK_RESULTS.map(r => ({
    ...r,
    student: MOCK_STUDENTS.find(s => s.id === r.studentId),
    course: MOCK_COURSES.find(c => c.id === r.courseId),
  }))

  const handlePublish = async (id: string) => {
    setPublishing(id)
    await delay(600)
    setPublishing(null)
    toast.success('Result published successfully!')
  }

  return (
    <div>
      <PageHeader
        title="Results"
        subtitle={`${MOCK_RESULTS.filter(r => r.isPublished).length} published, ${MOCK_RESULTS.filter(r => !r.isPublished).length} pending`}
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Theory</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Practical</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Grade</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Exam Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enriched.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{r.student?.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">{r.student?.studentId}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{r.course?.name?.split(' ').slice(0, 2).join(' ')}</td>
                  <td className="px-5 py-3 text-slate-700 font-mono">{r.theoryScore ?? '-'}</td>
                  <td className="px-5 py-3 text-slate-700 font-mono">{r.practicalScore ?? '-'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_COLORS[r.finalGrade] || 'bg-stone-100'}`}>{r.finalGrade}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{r.examDate ? formatDate(r.examDate) : '-'}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.isPublished ? 'published' : 'pending'} />
                  </td>
                  <td className="px-5 py-3">
                    {!r.isPublished ? (
                      <button
                        onClick={() => handlePublish(r.id)}
                        disabled={publishing === r.id}
                        className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2.5 py-1 rounded-lg font-semibold transition-colors disabled:opacity-50"
                      >
                        {publishing === r.id ? '...' : 'Publish'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">{r.publishedAt ? formatDate(r.publishedAt) : 'Published'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
