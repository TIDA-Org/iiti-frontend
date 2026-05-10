'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGetCompletionReport, CompletionReportApiResponse } from '@/lib/api/reports'
import { apiGetCourses, CourseApiResponse } from '@/lib/api/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { BarChart3, Download } from 'lucide-react'
import { toast } from 'sonner'

const gradeColors: Record<string, string> = {
  distinction: 'bg-green-100 text-green-800',
  merit: 'bg-blue-100 text-blue-800',
  credit: 'bg-amber-100 text-amber-800',
  pass: 'bg-yellow-100 text-yellow-800',
  fail: 'bg-red-100 text-red-800',
  absent: 'bg-slate-100 text-slate-800',
  not_graded: 'bg-gray-100 text-gray-800',
}

export default function CompletionReportPage() {
  const [reportData, setReportData] = useState<CompletionReportApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [batchId, setBatchId] = useState('')

  const { hasPermission } = usePermissionAccess()
  const { data: coursesData } = useApi<CourseApiResponse[]>(() => apiGetCourses(), [])

  const courses = useMemo(() => coursesData || [], [coursesData])

  // Initialize date range (last 12 months)
  useEffect(() => {
    const end = new Date()
    const start = new Date(end)
    start.setFullYear(start.getFullYear() - 1)

    setEndDate(end.toISOString().split('T')[0])
    setStartDate(start.toISOString().split('T')[0])
  }, [])

  const loadReport = async () => {
    if (!hasPermission('reports.view')) {
      setError('You do not have permission to view reports')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetCompletionReport(
        startDate || undefined,
        endDate || undefined,
        courseId || undefined,
        batchId || undefined,
      )
      setReportData(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load report'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadAsCSV = () => {
    if (!reportData) return

    let csv = 'Course,Batch,Completions,Completion Rate %,Pass Rate %,Fail Rate %,Most Common Grade,Grade Distribution\n'

    reportData.rows.forEach((row) => {
      const gradeDist = row.grade_distribution
        .map((g) => `${g.grade}:${g.count}(${g.percentage}%)`)
        .join('; ')
      csv += `"${row.course_code}","${row.batch_title}",${row.stats.total_completions},${row.stats.completion_rate},${row.stats.pass_rate},${row.stats.fail_rate},"${row.stats.average_grade}","${gradeDist}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `completion_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  return (
    <div>
      <PageHeader
        title="Completion Report"
        subtitle="Course completion rates, pass/fail statistics, and grade distribution"
      />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Batch</label>
            <input
              type="text"
              placeholder="Optional batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadReport}
              disabled={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded px-4 py-2 text-sm font-medium transition-colors"
            >
              {isLoading ? 'Loading...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Report Data */}
      {reportData && (
        <div className="space-y-6">
          {/* Download Button */}
          <div className="flex justify-end">
            <button
              onClick={downloadAsCSV}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white rounded px-4 py-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download as CSV
            </button>
          </div>

          {/* Report Rows */}
          {reportData.rows.map((row, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              {/* Row Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{row.course_code}</h3>
                    <p className="text-slate-600 text-sm">{row.course_title}</p>
                    <p className="text-slate-500 text-xs mt-1">Batch: {row.batch_title}</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Completions</p>
                    <p className="text-xl font-bold text-slate-900">{row.stats.total_completions}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Completion Rate</p>
                    <p className="text-xl font-bold text-blue-600">{row.stats.completion_rate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Pass Rate</p>
                    <p className="text-xl font-bold text-green-600">{row.stats.pass_rate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Fail Rate</p>
                    <p className="text-xl font-bold text-red-600">{row.stats.fail_rate}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600 text-xs mb-1">Most Common</p>
                    <p className="text-xl font-bold text-amber-600 capitalize">{row.stats.average_grade}</p>
                  </div>
                </div>
              </div>

              {/* Grade Distribution */}
              <div className="px-6 py-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Grade Distribution</h4>
                <div className="space-y-2">
                  {row.grade_distribution.map((grade) => (
                    <div key={grade.grade} className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${gradeColors[grade.grade] || gradeColors['not_graded']} capitalize min-w-24`}>
                        {grade.grade}
                      </span>
                      <div className="flex-1 bg-slate-200 rounded-full h-6 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full flex items-center justify-end pr-2"
                          style={{ width: `${grade.percentage}%` }}
                        >
                          {grade.percentage > 10 && (
                            <span className="text-xs font-semibold text-white">{grade.percentage}%</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-slate-600 font-medium min-w-16 text-right">
                        {grade.count} ({grade.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Data State */}
      {!reportData && !isLoading && !error && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Select filters and click &quot;Generate Report&quot; to view completion statistics.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <DataLoader isLoading={isLoading} error={error}><p>Loading...</p></DataLoader>}
    </div>
  )
}
