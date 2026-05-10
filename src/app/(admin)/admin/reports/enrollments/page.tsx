'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGetEnrollmentReport, EnrollmentReportApiResponse } from '@/lib/api/reports'
import { apiGetCourses, CourseApiResponse } from '@/lib/api/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { formatDate } from '@/lib/utils'
import { BarChart3, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function EnrollmentReportPage() {
  const [reportData, setReportData] = useState<EnrollmentReportApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [reportType, setReportType] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [courseId, setCourseId] = useState('')

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
      const data = await apiGetEnrollmentReport(
        reportType,
        startDate || undefined,
        endDate || undefined,
        courseId || undefined,
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

    let csv = 'Course,Batch,Period,Total Enrollments,New,Withdrawn,Completed,Active,On Hold,Expelled,Overdue\n'

    reportData.rows.forEach((row) => {
      const stats = row.stats
      csv += `"${row.course_code}","${row.batch_title}","${row.period}",${stats.total_enrollments},${stats.new_enrollments},${stats.withdrawn},${stats.completed},${stats.active},${stats.on_hold},${stats.expelled},${stats.payment_overdue}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `enrollment_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  return (
    <div>
      <PageHeader title="Enrollment Report" subtitle="Monthly and yearly enrollment statistics by course and batch" />

      {/* Filters */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-slate-600 text-sm mb-1">Report Type</p>
              <p className="text-2xl font-bold text-slate-900 capitalize">{reportData.report_type}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-slate-600 text-sm mb-1">Date Range</p>
              <p className="text-sm font-medium text-slate-900">
                {reportData.start_date} to {reportData.end_date}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-slate-600 text-sm mb-1">Rows</p>
              <p className="text-2xl font-bold text-slate-900">{reportData.total_rows}</p>
            </div>
          </div>

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

          {/* Report Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Course</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Batch</th>
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Period</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Total</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">New</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Completed</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Active</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Withdrawn</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Overdue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-900">{row.course_code}</p>
                        <p className="text-slate-600 text-xs">{row.course_title}</p>
                      </td>
                      <td className="px-6 py-3 text-slate-700">{row.batch_title}</td>
                      <td className="px-6 py-3 text-slate-700">{row.period}</td>
                      <td className="px-6 py-3 text-center font-semibold text-slate-900">{row.stats.total_enrollments}</td>
                      <td className="px-6 py-3 text-center text-blue-600">{row.stats.new_enrollments}</td>
                      <td className="px-6 py-3 text-center text-green-600">{row.stats.completed}</td>
                      <td className="px-6 py-3 text-center text-amber-600">{row.stats.active}</td>
                      <td className="px-6 py-3 text-center text-slate-600">{row.stats.withdrawn}</td>
                      <td className="px-6 py-3 text-center text-red-600">{row.stats.payment_overdue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!reportData && !isLoading && !error && (
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Select filters and click &quot;Generate Report&quot; to view enrollment statistics.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <DataLoader isLoading={isLoading} error={error}><p>Loading...</p></DataLoader>}
    </div>
  )
}
