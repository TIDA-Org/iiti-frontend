'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Forklift', value: 45 },
  { name: 'Excavator', value: 32 },
  { name: 'Backhoe Loader', value: 23 },
]
const COLORS = ['#F59E0B', '#F97316', '#EAB308']

export function CoursePopularityChart() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Course Popularity</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip
            formatter={(value) => {
              const numericValue = typeof value === 'number' ? value : Number(value)
              return [`${Number.isFinite(numericValue) ? numericValue : 0}%`, 'Share']
            }}
            contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
