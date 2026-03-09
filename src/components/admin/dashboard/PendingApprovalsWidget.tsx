import Link from 'next/link'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'

export function PendingApprovalsWidget() {
  const pending = MOCK_ENROLLMENTS.filter(e => e.status === 'pending').slice(0, 3)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-700" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Approvals</h3>
        {pending.length > 0 && (
          <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full">{pending.length}</span>
        )}
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">No pending approvals</p>
      ) : (
        <div className="space-y-3">
          {pending.map((enrollment) => {
            const student = MOCK_STUDENTS.find(s => s.id === enrollment.studentId)
            const course = MOCK_COURSES.find(c => c.id === enrollment.courseId)
            return (
              <div key={enrollment.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-700">{student?.fullName}</p>
                  <p className="text-xs text-slate-400">{course?.name?.split(' ').slice(0, 2).join(' ')}</p>
                </div>
                <Link href={`/admin/enrollments/${enrollment.id}`} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                  Review
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
