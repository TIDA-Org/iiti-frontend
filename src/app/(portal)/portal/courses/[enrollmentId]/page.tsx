'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Hash,
  Info,
  Loader2,
  MapPin,
  Trophy,
  XCircle,
} from 'lucide-react'
import { apiGetMyEnrollmentDetail, type EnrollmentDetailApiResponse } from '@/lib/api/enrollments'
import { apiGetInstallmentBreakdown, apiGetPaymentsForEnrollment } from '@/lib/api/payments'
import type { ResultApiResponse } from '@/lib/api/results'
import type { InstallmentBreakdownApiResponse, PaymentApiResponse } from '@/types/payment'
import { cn } from '@/lib/utils'

// ── Extended enrollment type with embedded relations ───────────────────────
interface CourseEmbedded {
  id: string
  name: string
  short_name: string | null
  course_code: string
  description: string | null
  total_fee: number
  nvq_level: string | null
  nvq_option_extra_fee: number
  max_installments: number
  is_trial: boolean
  allows_installment: boolean
}

interface LocationEmbedded {
  id: number
  name: string
  address: string | null
  city: string | null
}

interface BatchEmbedded {
  id: string
  batch_code: string
  start_date: string
  end_date: string
  status: string
  instructor_name: string | null
  location: LocationEmbedded | null
}

interface EnrollmentWithRelations extends EnrollmentDetailApiResponse {
  course: CourseEmbedded | null
  batch: BatchEmbedded | null
  result: ResultApiResponse | null
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtDateTime(val: string | null | undefined) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
function fmtLkr(val: number | null | undefined) {
  if (val == null) return '—'
  return `LKR ${val.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}
function toLabel(v: string) {
  return v.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  completed: 'bg-blue-100 text-blue-700 border-blue-200',
  pending_payment: 'bg-amber-100 text-amber-700 border-amber-200',
  payment_overdue: 'bg-red-100 text-red-700 border-red-200',
  on_hold: 'bg-slate-100 text-slate-600 border-slate-200',
  withdrawn: 'bg-red-100 text-red-700 border-red-200',
  expelled: 'bg-red-200 text-red-800 border-red-300',
  upcoming: 'bg-blue-100 text-blue-700 border-blue-200',
  ongoing: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
}

const paymentStatusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  under_review: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-500',
}

const installmentStatusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  overdue: 'bg-red-100 text-red-700 border-red-200',
  rejected: 'bg-rose-100 text-rose-700 border-rose-200',
}

// ── Sub-components ─────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <div className="text-sm font-medium text-slate-800">{value ?? '—'}</div>
      </div>
    </div>
  )
}

function Section({
  title,
  children,
  icon: Icon,
  className,
}: {
  title: string
  children: React.ReactNode
  icon: React.ElementType
  className?: string
}) {
  return (
    <div className={cn('bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm', className)}>
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-orange-500" />
        </div>
        <h2 className="font-semibold text-sm text-slate-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function CourseDetailPage({ params }: { params: Promise<{ enrollmentId: string }> }) {
  const { enrollmentId } = use(params)
  const router = useRouter()

  const [enrollment, setEnrollment] = useState<EnrollmentWithRelations | null>(null)
  const [breakdown, setBreakdown] = useState<InstallmentBreakdownApiResponse | null>(null)
  const [payments, setPayments] = useState<PaymentApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enrollmentId) return
    let cancelled = false
    ;(async () => {
      setIsLoading(true)
      try {
        const [enr, bd, pmts] = await Promise.all([
          apiGetMyEnrollmentDetail(enrollmentId),
          apiGetInstallmentBreakdown(enrollmentId).catch(() => null),
          apiGetPaymentsForEnrollment(enrollmentId).catch(() => [] as PaymentApiResponse[]),
        ])
        if (!cancelled) {
          setEnrollment(enr as EnrollmentWithRelations)
          setBreakdown(bd)
          setPayments(Array.isArray(pmts) ? pmts : [])
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load enrollment.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [enrollmentId])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
        <p className="text-slate-500 text-sm">Loading course details…</p>
      </div>
    )
  }

  if (error || !enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-3">
        <XCircle className="w-10 h-10 text-red-400" />
        <p className="text-slate-600 font-medium">{error ?? 'Enrollment not found.'}</p>
        <button onClick={() => router.back()} className="text-sm text-orange-600 hover:underline">
          Go back
        </button>
      </div>
    )
  }

  const { course, batch, result } = enrollment

  const paidCount = payments.filter((p) => p.payment_status === 'completed').length
  const refundedCount = payments.filter((p) => p.payment_status === 'refunded').length
  // Net installments = paid minus refunded (refunds free the slot)
  const netCompleted = Math.max(0, paidCount - refundedCount)
  const totalInstallments = breakdown?.installments.length ?? 3
  const progressPct =
    enrollment.total_fee_at_enrollment > 0
      ? Math.min(100, Math.round((enrollment.amount_paid / enrollment.total_fee_at_enrollment) * 100))
      : 0

  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-5">
        <Link href="/portal/courses" className="hover:text-orange-600 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          My Courses
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 font-medium truncate">
          {course?.name ?? enrollment.enrollment_number}
        </span>
      </div>

      {/* Hero Card */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 mb-5 text-white shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border',
                  statusColors[enrollment.enrollment_status] ?? 'bg-white/20 text-white border-white/30'
                )}
              >
                {toLabel(enrollment.enrollment_status)}
              </span>
              {enrollment.is_retake && (
                <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 border border-white/30">
                  Retake
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {course?.name ?? 'Course Detail'}
            </h1>
            {course?.course_code && (
              <p className="text-orange-100 text-sm font-mono">{course.course_code}</p>
            )}
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-orange-100 mb-1.5">
            <span>Payment Progress</span>
            <span>
              {fmtLkr(enrollment.amount_paid)} of {fmtLkr(enrollment.total_fee_at_enrollment)}
            </span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5 text-xs text-orange-100">
            <span>
              {netCompleted} of {totalInstallments} installments paid
              {refundedCount > 0 && ` (${refundedCount} refunded)`}
            </span>
            <span>{progressPct}%</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Enrollment Info */}
        <Section title="Enrollment Info" icon={FileText}>
          <InfoRow icon={Hash} label="Enrollment Number" value={<span className="font-mono">{enrollment.enrollment_number}</span>} />
          <InfoRow icon={CalendarDays} label="Enrolled Date" value={fmtDate(enrollment.enrollment_date)} />
          <InfoRow icon={CreditCard} label="Payment Plan" value={toLabel(enrollment.payment_plan)} />
          <InfoRow icon={GraduationCap} label="NVQ Selected" value={enrollment.nvq_selected ? 'Yes' : 'No'} />
          {enrollment.notes && <InfoRow icon={Info} label="Notes" value={enrollment.notes} />}
        </Section>

        {/* Course Info */}
        {course && (
          <Section title="Course Info" icon={BookOpen}>
            {course.description && (
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{course.description}</p>
            )}
            <InfoRow icon={Hash} label="Course Code" value={<span className="font-mono">{course.course_code}</span>} />
            <InfoRow icon={Trophy} label="NVQ Level" value={course.nvq_level ?? 'Not NVQ'} />
            <InfoRow icon={CreditCard} label="Standard Fee" value={fmtLkr(course.total_fee)} />
            <InfoRow icon={Info} label="Max Installments" value={String(course.max_installments)} />
          </Section>
        )}

        {/* Batch & Schedule */}
        {batch && (
          <Section title="Batch & Schedule" icon={Calendar}>
            <InfoRow icon={Hash} label="Batch Code" value={<span className="font-mono">{batch.batch_code}</span>} />
            <InfoRow icon={CalendarDays} label="Start Date" value={fmtDate(batch.start_date)} />
            <InfoRow icon={CalendarCheck} label="End Date" value={fmtDate(batch.end_date)} />
            <InfoRow
              icon={Info}
              label="Status"
              value={
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold border',
                    statusColors[batch.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                  )}
                >
                  {toLabel(batch.status)}
                </span>
              }
            />
            {batch.instructor_name && (
              <InfoRow icon={GraduationCap} label="Instructor" value={batch.instructor_name} />
            )}
            {batch.location?.name && (
              <InfoRow icon={MapPin} label="Location" value={batch.location.name} />
            )}
          </Section>
        )}

        {/* Fee Breakdown */}
        {enrollment.fee_breakdown && (
          <Section title="Fee Breakdown" icon={CreditCard}>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Base Course Fee</span>
                <span className="font-medium">{fmtLkr(enrollment.fee_breakdown.base_fee as number)}</span>
              </div>
              {enrollment.nvq_selected && (
                <div className="flex justify-between items-center text-sm py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">NVQ Fee</span>
                  <span className="font-medium">{fmtLkr(enrollment.fee_breakdown.nvq_fee as number)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm py-2 bg-orange-50 rounded-lg px-3 mt-1">
                <span className="font-semibold text-orange-700">Total Payable</span>
                <span className="font-bold text-orange-700">{fmtLkr(enrollment.fee_breakdown.total as number)}</span>
              </div>
            </div>
          </Section>
        )}

        {/* Installment Schedule */}
        {breakdown && (
          <div className="lg:col-span-2">
            <Section title="Installment Schedule" icon={Clock}>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-slate-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Total Fee</p>
                  <p className="font-bold text-slate-800 text-sm">{fmtLkr(breakdown.total_fee)}</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-green-500 mb-1">Paid</p>
                  <p className="font-bold text-green-700 text-sm">{fmtLkr(breakdown.total_paid)}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-amber-500 mb-1">Remaining</p>
                  <p className="font-bold text-amber-700 text-sm">{fmtLkr(breakdown.remaining_balance)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {breakdown.installments.map((inst) => (
                  <div
                    key={inst.installment_number}
                    className={cn(
                      'flex items-center justify-between rounded-xl px-4 py-3 border',
                      installmentStatusColors[inst.status] ?? 'bg-slate-50 text-slate-600 border-slate-100'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {inst.status === 'paid' ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      ) : inst.status === 'overdue' ? (
                        <XCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-semibold">Installment {inst.installment_number}</p>
                        <p className="text-xs opacity-75">Due: {fmtDate(inst.due_date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{fmtLkr(inst.amount_due)}</p>
                      <p className="text-xs font-medium capitalize">{inst.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="lg:col-span-2">
            <Section title="Payment History" icon={CreditCard}>
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-xl border border-slate-100 px-4 py-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                        paymentStatusColors[p.payment_status] ?? 'bg-slate-100'
                      )}
                    >
                      {p.payment_status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800 font-mono">{p.receipt_number}</span>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            paymentStatusColors[p.payment_status] ?? 'bg-slate-100 text-slate-600'
                          )}
                        >
                          {toLabel(p.payment_status)}
                        </span>
                        {p.payment_status === 'refunded' && (
                          <span className="text-xs text-slate-400">(Slot freed)</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Installment #{p.installment_number} · {fmtDateTime(p.created_at)}
                        {p.bank_name && ` · ${p.bank_name}`}
                        {p.branch_name && `, ${p.branch_name}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-800">{fmtLkr(p.amount)}</p>
                      {p.approved_at && (
                        <p className="text-xs text-green-500">Approved {fmtDate(p.approved_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Exam Result */}
        {result && (
          <div className="lg:col-span-2">
            <Section title="Exam Result" icon={Trophy}>
              <div className="grid sm:grid-cols-3 gap-3">
                {result.final_grade && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <p className="text-xs text-amber-500 font-medium mb-1">Grade</p>
                    <p className="text-3xl font-black text-amber-700">{result.final_grade}</p>
                  </div>
                )}
                {result.score_percentage != null && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                    <p className="text-xs text-blue-500 font-medium mb-1">Score</p>
                    <p className="text-2xl font-bold text-blue-700">{result.score_percentage}%</p>
                  </div>
                )}
                {result.result_status && (
                  <div
                    className={cn(
                      'rounded-xl p-4 text-center border',
                      result.result_status === 'pass'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-red-50 border-red-100'
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-medium mb-1',
                        result.result_status === 'pass' ? 'text-green-500' : 'text-red-500'
                      )}
                    >
                      Status
                    </p>
                    <p
                      className={cn(
                        'text-xl font-bold capitalize',
                        result.result_status === 'pass' ? 'text-green-700' : 'text-red-700'
                      )}
                    >
                      {result.result_status}
                    </p>
                  </div>
                )}
              </div>
              {result.remarks && (
                <p className="text-sm text-slate-500 mt-3 bg-slate-50 rounded-xl px-4 py-3 flex gap-2 items-start">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
                  {result.remarks}
                </p>
              )}
            </Section>
          </div>
        )}

        {/* Quick Actions */}
        <div className="lg:col-span-2 flex items-center gap-3 flex-wrap pt-2">
          <Link
            href="/portal/payments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            Go to Payments
          </Link>
          <Link
            href="/portal/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Courses
          </Link>
        </div>
      </div>
    </div>
  )
}
