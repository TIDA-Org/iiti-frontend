'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { toast } from 'sonner'
import { apiGetEnrollments, EnrollmentApiResponse } from '@/lib/api/enrollments'
import { apiCreateManualPayment, apiGetInstallmentBreakdown } from '@/lib/api/payments'
import { InstallmentBreakdownApiResponse } from '@/types/payment'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  ArrowLeft,
  Search,
  ChevronDown,
  Check,
  Calendar,
  CreditCard,
  AlertCircle,
  Clock,
  Layers,
  Sparkles,
  Info,
  Loader2,
  Receipt,
  User,
  BookOpen,
} from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  enrollment_id: z.string().min(1, 'Please select an enrollment'),
  amount: z.string().min(1, 'Amount is required'),
  manual_reason: z.string().min(3, 'Please provide a reason (min 3 characters)'),
  notes: z.string().optional(),
  is_advance: z.boolean().optional(),
})

type RecordPaymentFields = z.infer<typeof schema>

const formatLkr = (amt: number) =>
  `LKR ${amt.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function AdminRecordPaymentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [enrollments, setEnrollments] = useState<EnrollmentApiResponse[]>([])

  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [breakdown, setBreakdown] = useState<InstallmentBreakdownApiResponse | null>(null)
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecordPaymentFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_advance: false,
    },
  })

  const selectedEnrollmentId = watch('enrollment_id')
  const isAdvanceChecked = watch('is_advance')
  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId)

  useEffect(() => {
    apiGetEnrollments()
      .then(res => setEnrollments(Array.isArray(res) ? res : []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // When enrollment changes, fetch breakdown if installment plan or auto-fill values
  useEffect(() => {
    if (!selectedEnrollmentId) {
      setBreakdown(null)
      return
    }

    const currentEnrollment = enrollments.find(e => e.id === selectedEnrollmentId)
    if (!currentEnrollment) return

    if (currentEnrollment.payment_plan === 'installment') {
      setIsLoadingBreakdown(true)
      apiGetInstallmentBreakdown(selectedEnrollmentId)
        .then(data => {
          setBreakdown(data)
          const nextUnpaid = data.installments.find(i => i.status !== 'paid')
          if (nextUnpaid) {
            setValue('amount', nextUnpaid.amount_due.toString(), { shouldValidate: true })
            if (!isAdvanceChecked) {
              setValue(
                'manual_reason',
                `Counter payment for Installment #${nextUnpaid.installment_number}`,
                { shouldValidate: true }
              )
            }
          } else if (data.remaining_balance > 0) {
            setValue('amount', data.remaining_balance.toString(), { shouldValidate: true })
          }
        })
        .catch(err => {
          console.error('Failed to load installment breakdown:', err)
          setBreakdown(null)
        })
        .finally(() => {
          setIsLoadingBreakdown(false)
        })
    } else {
      setBreakdown(null)
      const remaining = Math.max(
        0,
        (currentEnrollment.total_fee_at_enrollment || 0) - (currentEnrollment.amount_paid || 0)
      )
      if (remaining > 0) {
        setValue('amount', remaining.toString(), { shouldValidate: true })
      }
      setValue('manual_reason', 'Counter cash payment - Full Fee', { shouldValidate: true })
    }
  }, [selectedEnrollmentId, enrollments, setValue])

  // Handle advance toggle
  const handleToggleAdvance = (checked: boolean) => {
    setValue('is_advance', checked)
    if (checked) {
      setValue('manual_reason', 'Advance fee deposit at counter', { shouldValidate: true })
    } else if (breakdown) {
      const nextUnpaid = breakdown.installments.find(i => i.status !== 'paid')
      if (nextUnpaid) {
        setValue(
          'manual_reason',
          `Counter payment for Installment #${nextUnpaid.installment_number}`,
          { shouldValidate: true }
        )
        setValue('amount', nextUnpaid.amount_due.toString(), { shouldValidate: true })
      }
    }
  }

  const filteredEnrollments = enrollments.filter(e => {
    const q = searchQuery.toLowerCase()
    return (
      (e.student?.full_name || '').toLowerCase().includes(q) ||
      (e.student?.nic_number || '').toLowerCase().includes(q) ||
      e.enrollment_number.toLowerCase().includes(q)
    )
  })

  const onSubmit = async (data: RecordPaymentFields) => {
    setIsLoading(true)
    try {
      await apiCreateManualPayment({
        enrollment_id: data.enrollment_id,
        amount: parseFloat(data.amount),
        manual_reason: data.manual_reason,
        notes: data.notes,
        is_advance: data.is_advance || false,
      })
      toast.success('Cash payment recorded successfully! Installment breakdown updated in DB.')
      reset()
      router.push('/admin/payments')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to record payment.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white transition-all shadow-sm'
  const errClass = 'text-xs text-red-600 mt-1'

  const nextUnpaidSlot = breakdown?.installments.find(i => i.status !== 'paid')

  return (
    <div className="max-w-2xl pb-12">
      <PageHeader
        title="Record Cash Payment"
        subtitle="Manual counter cash payment entry with live installment recalculation"
        actions={
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="space-y-6">
        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Enrollment Selection */}
            <div ref={dropdownRef} className="relative">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Student Enrollment *
              </label>
              <input type="hidden" {...register('enrollment_id')} />

              {/* Dropdown trigger */}
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`${inputClass} flex items-center justify-between cursor-pointer hover:border-amber-400 ${
                  !selectedEnrollment ? 'text-slate-500' : 'text-slate-800 font-medium'
                }`}
              >
                <span className="truncate">
                  {selectedEnrollment
                    ? `${selectedEnrollment.student?.full_name ?? 'Unknown'} · #${selectedEnrollment.enrollment_number} (${selectedEnrollment.payment_plan === 'installment' ? 'Installment Plan' : 'Full Payment'})`
                    : '— Search and select enrollment —'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              </div>

              {/* Dropdown content */}
              {isDropdownOpen && (
                <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 flex flex-col overflow-hidden">
                  <div className="p-2.5 border-b border-slate-100 sticky top-0 bg-white z-20">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by student name, NIC, or enrollment #..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        onClick={e => e.stopPropagation()}
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-1.5 text-sm bg-white divide-y divide-slate-50">
                    {filteredEnrollments.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-sm">No enrollments found.</div>
                    ) : (
                      filteredEnrollments.map(e => (
                        <div
                          key={e.id}
                          onClick={() => {
                            setValue('enrollment_id', e.id, { shouldValidate: true })
                            setIsDropdownOpen(false)
                            setSearchQuery('')
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedEnrollmentId === e.id
                              ? 'bg-amber-50/80 text-amber-950 border border-amber-200/60'
                              : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex flex-col truncate pr-3">
                            <span className="font-semibold text-slate-800">
                              {e.student?.full_name ?? 'Unknown Student'}
                            </span>
                            <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>#{e.enrollment_number}</span>
                              <span>·</span>
                              <span>NIC: {e.student?.nic_number ?? 'N/A'}</span>
                              <span>·</span>
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                  e.payment_plan === 'installment'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {e.payment_plan}
                              </span>
                            </span>
                          </div>
                          {selectedEnrollmentId === e.id && (
                            <Check className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {errors.enrollment_id && <p className={errClass}>{errors.enrollment_id.message}</p>}
            </div>

            {/* Selected Enrollment Details & Installment Breakdown */}
            {selectedEnrollment && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
                {/* Header Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-semibold text-slate-800">
                      {selectedEnrollment.student?.full_name}
                    </span>
                    <span className="text-xs text-slate-500">
                      (#{selectedEnrollment.enrollment_number})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        selectedEnrollment.payment_plan === 'installment'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {selectedEnrollment.payment_plan === 'installment'
                        ? 'Installment Plan'
                        : 'Full Payment'}
                    </span>
                  </div>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
                    <p className="text-slate-500 font-medium">Total Fee</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {formatLkr(selectedEnrollment.total_fee_at_enrollment || 0)}
                    </p>
                  </div>
                  <div className="bg-white border border-green-200 rounded-xl p-3 shadow-2xs">
                    <p className="text-green-600 font-medium">Paid So Far</p>
                    <p className="font-bold text-green-700 text-sm mt-0.5">
                      {formatLkr(selectedEnrollment.amount_paid || 0)}
                    </p>
                  </div>
                  <div className="bg-white border border-amber-200 rounded-xl p-3 shadow-2xs">
                    <p className="text-amber-600 font-medium">Remaining Due</p>
                    <p className="font-bold text-amber-700 text-sm mt-0.5">
                      {formatLkr(
                        Math.max(
                          0,
                          (selectedEnrollment.total_fee_at_enrollment || 0) -
                            (selectedEnrollment.amount_paid || 0)
                        )
                      )}
                    </p>
                  </div>
                </div>

                {/* Installment Breakdown Table (for Installment Plan) */}
                {selectedEnrollment.payment_plan === 'installment' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wide">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        Installment Breakdown in Database
                      </div>
                      {isLoadingBreakdown && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading slots…
                        </div>
                      )}
                    </div>

                    {breakdown && breakdown.installments.length > 0 ? (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-3.5 py-2.5 text-left text-slate-500 font-semibold">
                                Slot #
                              </th>
                              <th className="px-3.5 py-2.5 text-left text-slate-500 font-semibold">
                                Amount Due
                              </th>
                              <th className="px-3.5 py-2.5 text-left text-slate-500 font-semibold">
                                Due Date
                              </th>
                              <th className="px-3.5 py-2.5 text-right text-slate-500 font-semibold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {breakdown.installments.map(inst => (
                              <tr
                                key={inst.installment_number}
                                className={
                                  nextUnpaidSlot?.installment_number === inst.installment_number &&
                                  !isAdvanceChecked
                                    ? 'bg-amber-50/40 font-medium'
                                    : ''
                                }
                              >
                                <td className="px-3.5 py-2.5 text-slate-700">
                                  <div className="flex items-center gap-1.5">
                                    <span>Installment #{inst.installment_number}</span>
                                    {nextUnpaidSlot?.installment_number ===
                                      inst.installment_number &&
                                      !isAdvanceChecked && (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                                          NEXT
                                        </span>
                                      )}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                                  {formatLkr(inst.amount_due)}
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-500">
                                  {inst.due_date ? (
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 text-slate-400" />
                                      {new Date(inst.due_date).toLocaleDateString('en-GB', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">Not set</span>
                                  )}
                                </td>
                                <td className="px-3.5 py-2.5 text-right">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                      inst.status === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : inst.status === 'overdue'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-amber-100 text-amber-700'
                                    }`}
                                  >
                                    {inst.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : !isLoadingBreakdown ? (
                      <p className="text-xs text-slate-500 italic">
                        No installment slots found in database for this enrollment.
                      </p>
                    ) : null}

                    {/* Advance Payment Option Toggle */}
                    <div className="pt-2 border-t border-slate-200/70">
                      <label className="flex items-start gap-3 cursor-pointer p-2.5 rounded-xl hover:bg-slate-100/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={!!isAdvanceChecked}
                          onChange={e => handleToggleAdvance(e.target.checked)}
                          className="mt-0.5 w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
                        />
                        <div>
                          <span className="text-xs font-semibold text-slate-800">
                            This is an Advance / Registration Deposit (Installment #0)
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Advance payments do not consume an installment slot. The payment amount
                            reduces the total balance and is evenly spread across all 3 installment slots.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Amount Received (LKR) *
                </label>
                {/* Quick-fill helper buttons */}
                {selectedEnrollment && (
                  <div className="flex items-center gap-2">
                    {selectedEnrollment.payment_plan === 'installment' && nextUnpaidSlot && (
                      <button
                        type="button"
                        onClick={() =>
                          setValue('amount', nextUnpaidSlot.amount_due.toString(), {
                            shouldValidate: true,
                          })
                        }
                        className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md font-medium transition-colors"
                      >
                        Fill Slot #{nextUnpaidSlot.installment_number} ({formatLkr(nextUnpaidSlot.amount_due)})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const rem = Math.max(
                          0,
                          (selectedEnrollment.total_fee_at_enrollment || 0) -
                            (selectedEnrollment.amount_paid || 0)
                        )
                        setValue('amount', rem.toString(), { shouldValidate: true })
                      }}
                      className="text-[11px] text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-0.5 rounded-md font-medium transition-colors"
                    >
                      Fill Full Remaining
                    </button>
                  </div>
                )}
              </div>
              <input
                {...register('amount')}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={inputClass}
              />
              {errors.amount && <p className={errClass}>{errors.amount.message}</p>}
            </div>

            {/* Manual Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Reason / Reference *
              </label>
              <input
                {...register('manual_reason')}
                type="text"
                placeholder="e.g. Counter Cash Deposit for Installment #1"
                className={inputClass}
              />
              {errors.manual_reason && <p className={errClass}>{errors.manual_reason.message}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Staff Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                placeholder="e.g. Paid in cash at counter front desk"
                className={inputClass + ' resize-none'}
              />
            </div>

            {/* Notice */}
            {selectedEnrollment?.payment_plan === 'installment' && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Recording this cash payment will immediately credit{' '}
                  {isAdvanceChecked
                    ? 'as an advance deposit'
                    : `Installment #${nextUnpaidSlot?.installment_number ?? 1}`}{' '}
                  and automatically recalculate all remaining unpaid installment slot amounts in the database.
                </span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 disabled:opacity-70 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording & Updating Breakdown…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Cash Payment & Update Breakdown
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
