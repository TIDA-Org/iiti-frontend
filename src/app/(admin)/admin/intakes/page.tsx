import { MOCK_INTAKES } from '@/lib/mock-data/intakes'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Calendar } from 'lucide-react'

export default function AdminIntakesPage() {
  return (
    <div>
      <PageHeader title="Intake Dates" subtitle="Training batch schedule management" />
      <div className="grid gap-4">
        {MOCK_INTAKES.map(intake => {
          const course = MOCK_COURSES.find(c => c.id === intake.courseId)
          const pct = Math.round((intake.enrolledCount / intake.maxCapacity) * 100)
          return (
            <div key={intake.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{intake.batchName}</h3>
                      <p className="text-xs text-slate-400">{course?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-3">
                    <span>Start: {formatDate(intake.startDate)}</span>
                    <span>End: {formatDate(intake.endDate)}</span>
                    <span>Capacity: {intake.enrolledCount}/{intake.maxCapacity}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400">{pct}% full</span>
                  </div>
                </div>
                <StatusBadge status={intake.status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
