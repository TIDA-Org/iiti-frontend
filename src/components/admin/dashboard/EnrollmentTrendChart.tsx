'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', enrollments: 12 },
  { month: 'Feb', enrollments: 18 },
  { month: 'Mar', enrollments: 15 },
  { month: 'Apr', enrollments: 25 },
  { month: 'May', enrollments: 22 },
  { month: 'Jun', enrollments: 30 },
  { month: 'Jul', enrollments: 28 },
  { month: 'Aug', enrollments: 35 },
  { month: 'Sep', enrollments: 26 },
  { month: 'Oct', enrollments: 40 },
  { month: 'Nov', enrollments: 38 },
  { month: 'Dec', enrollments: 45 },
]

export function EnrollmentTrendChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Enrollment Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
          <Line type="monotone" dataKey="enrollments" stroke="#F97316" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
