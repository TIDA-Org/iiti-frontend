import { ClipboardList } from 'lucide-react'

export function PendingApprovalsWidget() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Approvals</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">No pending approvals</p>
        <p className="text-xs text-slate-300 mt-1">Enrollment approvals will appear here</p>
      </div>
    </div>
  )
}
