import { MOCK_INTAKES } from '@/lib/mock-data/intakes'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { formatDate } from '@/lib/utils'

export function UpcomingIntakesWidget() {
  const upcoming = MOCK_INTAKES.filter(i => i.status === 'upcoming' || i.status === 'ongoing').slice(0, 3)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Intakes</h3>
      <div className="space-y-3">
        {upcoming.map((intake) => {
          const course = MOCK_COURSES.find(c => c.id === intake.courseId)
          const pct = Math.round((intake.enrolledCount / intake.maxCapacity) * 100)
          return (
            <div key={intake.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">{intake.batchName}</p>
                <span className="text-xs text-slate-400">{formatDate(intake.startDate)}</span>
              </div>
              <p className="text-xs text-slate-400">{course?.name?.split(' ').slice(0, 2).join(' ')}</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400">{intake.enrolledCount}/{intake.maxCapacity}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
