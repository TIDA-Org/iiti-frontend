'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApi } from '@/hooks/useApi'
import { apiGetEnrollments } from '@/lib/api/enrollments'
import { DataLoader } from '@/components/shared/DataLoader'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function EnrollmentTrendChart() {
  const { data: enrollments, isLoading, error, refetch } = useApi(() => apiGetEnrollments(), [])

  const chartData = useMemo(() => {
    const list = enrollments || []
    const fallback = MONTH_LABELS.map((month) => ({ month, enrollments: 0 }))
    if (list.length === 0) return fallback

    let targetYear = new Date().getFullYear()
    let latestTs = 0

    for (const item of list) {
      const ts = Date.parse(item.enrollment_date)
      if (Number.isNaN(ts)) continue
      if (ts > latestTs) {
        latestTs = ts
        targetYear = new Date(ts).getFullYear()
      }
    }

    const monthly = new Array<number>(12).fill(0)

    for (const item of list) {
      const dt = new Date(item.enrollment_date)
      if (Number.isNaN(dt.getTime())) continue
      if (dt.getFullYear() !== targetYear) continue
      monthly[dt.getMonth()] += 1
    }

    return MONTH_LABELS.map((month, idx) => ({ month, enrollments: monthly[idx] }))
  }, [enrollments])

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Enrollment Trend</h3>
      <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
            <Line type="monotone" dataKey="enrollments" stroke="#F97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </DataLoader>
    </div>
  )
}
