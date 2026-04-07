import { Calendar } from 'lucide-react'

export function UpcomingIntakesWidget() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Intakes</h3>
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Calendar className="w-8 h-8 text-slate-300 mb-2" />
        <p className="text-sm text-slate-400">No upcoming intakes</p>
        <p className="text-xs text-slate-300 mt-1">Intake batches will appear here</p>
      </div>
    </div>
  )
}
