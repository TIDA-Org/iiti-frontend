'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Jan', revenue: 245000 },
  { month: 'Feb', revenue: 310000 },
  { month: 'Mar', revenue: 280000 },
  { month: 'Apr', revenue: 420000 },
  { month: 'May', revenue: 390000 },
  { month: 'Jun', revenue: 510000 },
  { month: 'Jul', revenue: 475000 },
  { month: 'Aug', revenue: 560000 },
  { month: 'Sep', revenue: 445000 },
  { month: 'Oct', revenue: 620000 },
  { month: 'Nov', revenue: 580000 },
  { month: 'Dec', revenue: 710000 },
]

export function RevenueChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Monthly Revenue (LKR)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(value) => {
              const numericValue = typeof value === 'number' ? value : Number(value)
              const safeValue = Number.isFinite(numericValue) ? numericValue : 0
              return [`LKR ${safeValue.toLocaleString()}`, 'Revenue']
            }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
          />
          <Bar dataKey="revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
