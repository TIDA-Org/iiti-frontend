import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatLKR } from '@/lib/utils'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function PortalCoursesPage() {
  const enrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === 's1')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>My Courses</h1>
        <p className="text-stone-500 text-sm mt-1">Your enrolled training programmes</p>
      </div>

      {enrollments.length === 0 ? (
        <EmptyState icon={BookOpen} title="No courses enrolled" description="You have not been enrolled in any courses yet. Contact IITI to get started." />
      ) : (
        <div className="grid gap-4">
          {enrollments.map(enrollment => {
            const course = MOCK_COURSES.find(c => c.id === enrollment.courseId)
            const payments = MOCK_PAYMENTS.filter(p => p.enrollmentId === enrollment.id)
            const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
            const total = course?.fee || 0
            const pct = total > 0 ? Math.round((paid / total) * 100) : 0

            return (
              <div key={enrollment.id} className="bg-white rounded-xl border border-stone-200 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-800">{course?.name}</h3>
                      <p className="text-sm text-stone-500 mt-0.5">Code: {course?.code}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400">
                        <span>Enrolled: {formatDate(enrollment.enrolledAt)}</span>
                        <span>Duration: {course?.duration}</span>
                        <span>Plan: {enrollment.paymentPlan === 'installment' ? `${enrollment.installments} installments` : 'Full payment'}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={enrollment.status} />
                </div>
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
                    <span>Payment Progress</span>
                    <span>{formatLKR(paid)} / {formatLKR(total)}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-stone-400">{pct}% paid</span>
                    <Link href={`/portal/courses/${enrollment.id}`} className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-medium">
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
