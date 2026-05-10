'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGetPaymentReport, PaymentReportApiResponse } from '@/lib/api/reports'
import { apiGetCourses, CourseApiResponse } from '@/lib/api/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { BarChart3, Download } from 'lucide-react'
import { toast } from 'sonner'

const formatLkr = (amount: number): string => {
  return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function PaymentReportPage() {
  const [reportData, setReportData] = useState<PaymentReportApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [courseId, setCourseId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')

  const { hasPermission } = usePermissionAccess()
  const { data: coursesData } = useApi<CourseApiResponse[]>(() => apiGetCourses(), [])

  const courses = useMemo(() => coursesData || [], [coursesData])

  // Initialize date range (last 3 months)
  useEffect(() => {
    const end = new Date()
    const start = new Date(end)
    start.setMonth(start.getMonth() - 3)

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
      const data = await apiGetPaymentReport(
        startDate || undefined,
        endDate || undefined,
        courseId || undefined,
        paymentMethod || undefined,
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

    let csv = 'Course,Period,Collected,Pending,Overdue,Payment Count,Avg Payment,Payment Methods\n'

    reportData.rows.forEach((row) => {
      const methods = row.payment_methods.map((m) => `${m.method}(${m.count})`).join('; ')
      csv += `"${row.course_code}","${row.period}","${row.stats.total_collected}","${row.stats.total_pending}","${row.stats.total_overdue}",${row.stats.payment_count},${row.stats.average_payment},"${methods}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payment_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Report downloaded')
  }

  return (
    <div>
      <PageHeader
        title="Payment Report"
        subtitle="Revenue collected, pending amounts, and payment method breakdown"
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="cheque">Cheque</option>
              <option value="cash">Cash</option>
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
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <p className="text-green-700 text-sm mb-1">Collected</p>
              <p className="text-2xl font-bold text-green-900">{formatLkr(reportData.summary.total_collected)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
              <p className="text-amber-700 text-sm mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-900">{formatLkr(reportData.summary.total_pending)}</p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <p className="text-red-700 text-sm mb-1">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{formatLkr(reportData.summary.total_overdue)}</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <p className="text-slate-700 text-sm mb-1">Avg Payment</p>
              <p className="text-2xl font-bold text-slate-900">{formatLkr(reportData.summary.average_payment)}</p>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Payment Methods Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.payment_methods_summary.map((method) => (
                <div key={method.method} className="bg-slate-50 rounded-lg p-4">
                  <p className="text-slate-600 text-sm font-medium capitalize mb-2">{method.method}</p>
                  <p className="text-sm text-slate-700">
                    Count: <span className="font-semibold">{method.count}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    Amount: <span className="font-semibold">{formatLkr(method.amount)}</span>
                  </p>
                  <p className="text-sm text-slate-700">
                    % of Total: <span className="font-semibold text-amber-600">{method.percentage}%</span>
                  </p>
                </div>
              ))}
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
                    <th className="px-6 py-3 text-left font-semibold text-slate-700">Period</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Collected</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Pending</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Overdue</th>
                    <th className="px-6 py-3 text-center font-semibold text-slate-700">Payments</th>
                    <th className="px-6 py-3 text-right font-semibold text-slate-700">Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.rows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3">
                        <p className="font-medium text-slate-900">{row.course_code}</p>
                        <p className="text-slate-600 text-xs">{row.course_title}</p>
                      </td>
                      <td className="px-6 py-3 text-slate-700">{row.period}</td>
                      <td className="px-6 py-3 text-right text-green-600 font-medium">
                        {formatLkr(row.stats.total_collected)}
                      </td>
                      <td className="px-6 py-3 text-right text-amber-600 font-medium">
                        {formatLkr(row.stats.total_pending)}
                      </td>
                      <td className="px-6 py-3 text-right text-red-600 font-medium">
                        {formatLkr(row.stats.total_overdue)}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                          {row.stats.payment_count}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-medium text-slate-900">
                        {formatLkr(row.stats.average_payment)}
                      </td>
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
          <p className="text-slate-600">Select filters and click &quot;Generate Report&quot; to view payment statistics.</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <DataLoader isLoading={isLoading} error={error}><p>Loading...</p></DataLoader>}
    </div>
  )
}
