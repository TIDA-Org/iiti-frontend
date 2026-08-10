'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { toast } from 'sonner'
import { apiGetEnrollments, EnrollmentApiResponse } from '@/lib/api/enrollments'
import { apiCreateManualPayment } from '@/lib/api/payments'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowLeft, Search, ChevronDown, Check } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  enrollment_id: z.string().min(1, 'Please select an enrollment'),
  amount: z.string().min(1, 'Amount is required'),
  manual_reason: z.string().min(3, 'Please provide a reason (min 3 characters)'),
  notes: z.string().optional(),
})

type RecordPaymentFields = z.infer<typeof schema>

export default function AdminRecordPaymentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [enrollments, setEnrollments] = useState<EnrollmentApiResponse[]>([])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<RecordPaymentFields>({ resolver: zodResolver(schema) })

  const selectedEnrollmentId = watch('enrollment_id')
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
      })
      toast.success('Cash payment recorded successfully!')
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
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white'
  const errClass = 'text-xs text-red-600 mt-1'

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Record Cash Payment"
        subtitle="Manual counter cash payment entry"
        actions={
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Enrollment */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Student Enrollment *
            </label>
            <input type="hidden" {...register('enrollment_id')} />
            
            {/* Dropdown trigger */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${inputClass} flex items-center justify-between cursor-pointer ${
                  !selectedEnrollment ? 'text-slate-500' : 'text-slate-800'
                }`}
            >
              <span className="truncate">
                {selectedEnrollment 
                  ? `${selectedEnrollment.student?.full_name ?? 'Unknown'} · #${selectedEnrollment.enrollment_number}`
                  : '— Search and select enrollment —'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            </div>

            {/* Dropdown content */}
            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-72 flex flex-col">
                <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-lg z-20">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search by name, NIC, or enrollment #..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      onClick={(e) => e.stopPropagation()} 
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto p-1 text-sm bg-white rounded-b-lg">
                  {filteredEnrollments.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-sm">No enrollments found.</div>
                  ) : (
                    filteredEnrollments.map(e => (
                      <div
                        key={e.id}
                        onClick={() => {
                          setValue('enrollment_id', e.id, { shouldValidate: true })
                          setIsDropdownOpen(false)
                          setSearchQuery('')
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                          selectedEnrollmentId === e.id 
                            ? 'bg-amber-50 text-amber-900 border border-amber-200/50' 
                            : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="font-medium truncate">{e.student?.full_name ?? 'Unknown Student'}</span>
                          <span className="text-xs text-slate-500 mt-0.5">
                            #{e.enrollment_number} · NIC: {e.student?.nic_number ?? 'N/A'}
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

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Amount Received (LKR) *
            </label>
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
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Reason / Reference *
            </label>
            <input
              {...register('manual_reason')}
              type="text"
              placeholder="e.g. Counter Cash Deposit"
              className={inputClass}
            />
            {errors.manual_reason && <p className={errClass}>{errors.manual_reason.message}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Staff Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="e.g. Paid in cash at front desk"
              className={inputClass + ' resize-none'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-amber-300 disabled:opacity-70 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Recording…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Confirm Cash Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
