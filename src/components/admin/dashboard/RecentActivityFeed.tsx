import { formatDate } from '@/lib/utils'

const ACTIVITIES = [
  { id: 1, text: 'New enrollment: Tharaka Silva — Forklift Programme', time: '2025-03-07T10:30:00Z', type: 'enrollment' },
  { id: 2, text: 'Payment recorded: LKR 12,000 — Kasun Jayawardhana', time: '2025-03-07T09:45:00Z', type: 'payment' },
  { id: 3, text: 'Certificate issued: IITI-CERT-2025-010', time: '2025-03-06T16:20:00Z', type: 'certificate' },
  { id: 4, text: 'New job vacancy posted: Forklift Operator — Lanka Logistics', time: '2025-03-05T11:00:00Z', type: 'vacancy' },
  { id: 5, text: 'Results published: Excavator Batch EX-2024-B3', time: '2025-03-04T14:30:00Z', type: 'result' },
]

const typeColors: Record<string, string> = {
  enrollment: 'bg-blue-500',
  payment: 'bg-green-500',
  certificate: 'bg-amber-500',
  vacancy: 'bg-purple-500',
  result: 'bg-orange-500',
}

export function RecentActivityFeed() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Recent Activity</h3>
      <div className="space-y-4">
        {ACTIVITIES.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[activity.type]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-700 leading-snug">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-0.5">{formatDate(activity.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
