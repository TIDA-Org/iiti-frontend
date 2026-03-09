import { PageHeader } from '@/components/admin/layout/PageHeader'
import { formatDate } from '@/lib/utils'

const AUDIT_LOGS = [
  { id: 1, user: 'Chaminda Perera', action: 'Published result for Kasun Jayawardhana (Forklift)', timestamp: '2025-03-07T10:30:00Z', type: 'result' },
  { id: 2, user: 'Nirosha Silva', action: 'Approved enrollment: Tharaka Silva → Forklift Programme', timestamp: '2025-03-07T09:45:00Z', type: 'enrollment' },
  { id: 3, user: 'Thilak Fernando', action: 'Recorded payment LKR 12,000 for Kasun Jayawardhana', timestamp: '2025-03-07T09:00:00Z', type: 'payment' },
  { id: 4, user: 'Nirosha Silva', action: 'Created new vacancy: Forklift Operator at Lanka Logistics', timestamp: '2025-03-06T16:00:00Z', type: 'vacancy' },
  { id: 5, user: 'Chaminda Perera', action: 'Issued certificate IITI-CERT-2025-010', timestamp: '2025-03-05T14:20:00Z', type: 'certificate' },
]

const typeColors: Record<string, string> = { result: 'bg-blue-100 text-blue-700', enrollment: 'bg-green-100 text-green-700', payment: 'bg-amber-100 text-amber-700', vacancy: 'bg-purple-100 text-purple-700', certificate: 'bg-orange-100 text-orange-700' }

export default function AdminAuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity trail (Super Admin only)" />
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-50">
          {AUDIT_LOGS.map(log => (
            <div key={log.id} className="px-5 py-4 flex items-start gap-4">
              <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize flex-shrink-0 ${typeColors[log.type] || 'bg-slate-100 text-slate-600'}`}>{log.type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700">{log.action}</p>
                <p className="text-xs text-slate-400 mt-0.5">By: {log.user}</p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{formatDate(log.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
