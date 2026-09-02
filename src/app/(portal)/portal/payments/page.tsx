'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { PaymentApiResponse, InstallmentBreakdownApiResponse } from '@/types/payment'
import { apiGetMyEnrollments, EnrollmentApiResponse } from '@/lib/api/enrollments'
import {
  apiGetPaymentsForEnrollment,
  apiGetInstallmentBreakdown,
  apiCreatePayment,
} from '@/lib/api/payments'
import { apiUploadReceipt, apiGetReceiptSignedUrl } from '@/lib/api/receipts'
import { ReceiptApiResponse } from '@/types/receipt'
import {
  Wallet, TrendingDown, CheckCircle2, AlertCircle,
  Upload, X, Loader2, CreditCard, ChevronDown, ChevronUp,
  ExternalLink, Eye, BookOpen,
} from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { apiGetReceipts } from '@/lib/api/receipts'

const MAX_INSTALLMENTS = 3

function formatCurrency(amount: number) {
  return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Success Card (shown after payment submitted — stays until OK clicked) ──────

function SuccessCard({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-600" />
      </div>
      <div>
        <p className="font-bold text-slate-800 text-lg">Payment Submitted!</p>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Your bank slip has been uploaded. Status is now{' '}
          <span className="font-semibold text-amber-600">Under Review</span> — staff will
          verify and approve your payment shortly.
        </p>
      </div>
      <div className="mt-1 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 max-w-sm w-full">
        <p className="font-semibold mb-1">What happens next?</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-amber-700">
          <li>Staff reviews your bank deposit slip.</li>
          <li>The payment is marked Completed once verified.</li>
          <li>You&apos;ll receive an SMS notification when approved.</li>
        </ol>
      </div>
      <button
        onClick={onDismiss}
        className="mt-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
      >
        OK, Got It
      </button>
    </div>
  )
}

// ── Inline Payment Form ───────────────────────────────────────────────────────

interface PaymentFormProps {
  enrollment: EnrollmentApiResponse
  existingPayments: PaymentApiResponse[]
  remainingBalance: number
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({ enrollment, existingPayments, remainingBalance, onSuccess, onCancel }: PaymentFormProps) {
  const nextInstallment = existingPayments.length + 1
  const remainingCount = Math.max(1, MAX_INSTALLMENTS - existingPayments.length)
  const suggested = remainingBalance > 0
    ? parseFloat((remainingBalance / remainingCount).toFixed(2))
    : 0

  const [amount, setAmount] = useState<string>(String(suggested))
  const [bankReferenceNo, setBankReferenceNo] = useState('')
  const [bankName, setBankName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const numAmount = parseFloat(amount)
  const amountExceeds = !isNaN(numAmount) && numAmount > remainingBalance + 0.01

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) validateAndSetFile(dropped)
  }

  function validateAndSetFile(f: File) {
    if (f.size > 10 * 1024 * 1024) { setFormError('File must be under 10 MB.'); return }
    setFile(f)
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount greater than LKR 0.')
      return
    }
    if (numAmount > remainingBalance + 0.01) {
      setFormError(`Amount cannot exceed the remaining balance of ${formatCurrency(remainingBalance)}.`)
      return
    }
    if (!bankName.trim()) { setFormError('Bank Name is required.'); return }
    if (!branchName.trim()) { setFormError('Branch Name is required.'); return }
    if (!transferDate) { setFormError('Transfer / Deposit Date is required.'); return }
    if (!file) {
      setFormError('Please attach your bank deposit slip image or PDF.')
      return
    }

    setSubmitting(true)
    try {
      const payment = await apiCreatePayment({
        enrollment_id: enrollment.id,
        student_id: enrollment.student_id,
        amount: numAmount,
        currency: 'LKR',
        payment_method: 'bank_transfer',
        bank_reference_no: bankReferenceNo.trim() || undefined,
        bank_name: bankName.trim(),
        branch_name: branchName.trim(),
        transfer_date: transferDate,
      })
      await apiUploadReceipt(payment.id, file)
      setSuccess(true)
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return <SuccessCard onDismiss={onSuccess} />
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Installment info banner */}
      <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
        <div>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">You are paying</p>
          <p className="font-bold text-slate-800 text-base mt-0.5">
            Installment #{nextInstallment} of {MAX_INSTALLMENTS}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Remaining balance</p>
          <p className="font-bold text-slate-800">{formatCurrency(remainingBalance)}</p>
        </div>
      </div>

      {formError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {formError}
        </div>
      )}

      {/* Amount + Bank Ref */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Paid Amount (LKR) <span className="text-red-500">*</span>
          </label>
          <input
            type="number" step="0.01" min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder={`e.g. ${suggested}`}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm font-semibold bg-white focus:outline-none focus:ring-2 transition-all ${amountExceeds
              ? 'border-red-400 focus:ring-red-200 text-red-700'
              : 'border-slate-200 focus:ring-amber-300 focus:border-amber-400 text-slate-800'
            }`}
          />
          {amountExceeds && (
            <p className="text-xs text-red-600 mt-1">Exceeds remaining balance ({formatCurrency(remainingBalance)})</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Bank Reference / Slip No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bankReferenceNo}
            onChange={(e) => setBankReferenceNo(e.target.value)}
            required
            placeholder="e.g. REF-12345678"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Bank Name + Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Bank Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            placeholder="e.g. Commercial Bank"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Branch Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            required
            placeholder="e.g. Colombo 03"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Transfer Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Transfer / Deposit Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
          Bank Deposit Slip <span className="text-red-500">*</span>
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${dragOver
            ? 'border-amber-400 bg-amber-50'
            : file
              ? 'border-green-400 bg-green-50/50'
              : 'border-slate-200 bg-slate-50 hover:border-amber-300 hover:bg-amber-50/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
          />
          {file ? (
            <>
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-semibold">{file.name}</span>
              </div>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Click or drag to upload slip</p>
              <p className="text-xs text-slate-400">JPG, PNG, WEBP, or PDF · Max 10 MB</p>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || amountExceeds}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <><Upload className="w-4 h-4" /> Submit Payment & Bank Slip</>
          )}
        </button>
      </div>
    </form>
  )
}

// ── Payment Records Table (Student View) ──────────────────────────────────────

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pending Upload',
    under_review: 'Under Review',
    completed: 'Paid',
    rejected: 'Slip Rejected',
    refunded: 'Refunded',
  }
  return labels[status] ?? status
}

interface SlipViewerProps {
  paymentId: string
  receipts: ReceiptApiResponse[]
}

function SlipViewerButton({ paymentId, receipts }: SlipViewerProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const receipt = receipts.find(r => r.payment_id === paymentId)
  if (!receipt) return <span className="text-xs text-slate-400">—</span>

  const open = async () => {
    if (url) { window.open(url, '_blank'); return }
    setLoading(true)
    try {
      const { signed_url } = await apiGetReceiptSignedUrl(receipt.id)
      setUrl(signed_url)
      window.open(signed_url, '_blank')
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={open}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
      View Slip
    </button>
  )
}

interface StudentPaymentsTableProps {
  payments: PaymentApiResponse[]
  receipts: ReceiptApiResponse[]
  isLoading: boolean
}

function StudentPaymentsTable({ payments, receipts, isLoading }: StudentPaymentsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-32">Receipt #</TableHead>
            <TableHead className="min-w-24">Installment</TableHead>
            <TableHead className="min-w-36">Amount</TableHead>
            <TableHead className="min-w-32">Due Date</TableHead>
            <TableHead className="min-w-36">Status</TableHead>
            <TableHead className="min-w-36">Paid At</TableHead>
            <TableHead className="min-w-28">Slip</TableHead>
            <TableHead className="min-w-36">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4 animate-pulse" /> Loading payments...
                  </span>
                ) : 'No payment records found.'}
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p) => (
              <TableRow key={p.id} className="align-middle">
                <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                <TableCell className="text-center">{p.installment_number} / {p.total_installments}</TableCell>
                <TableCell className="font-semibold">
                  {p.currency} {p.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-sm">{formatDate(p.due_date)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.payment_status} />
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {paymentStatusLabel(p.payment_status)}
                  </span>
                </TableCell>
                {/* Paid At — shows approved_at date */}
                <TableCell className="text-sm">{formatDate(p.approved_at)}</TableCell>
                {/* View Slip */}
                <TableCell>
                  <SlipViewerButton paymentId={p.id} receipts={receipts} />
                </TableCell>
                {/* Action column */}
                <TableCell>
                  {p.payment_status === 'pending' || p.payment_status === 'rejected' ? (
                    <a
                      href={`/portal/payments/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload Slip
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">No action needed</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// ── Enrollment Selector ───────────────────────────────────────────────────────

interface EnrollmentCardProps {
  enrollment: EnrollmentApiResponse
  isSelected: boolean
  onClick: () => void
}

function EnrollmentCard({ enrollment, isSelected, onClick }: EnrollmentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
        ? 'border-amber-400 bg-amber-50'
        : 'border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-amber-400' : 'bg-slate-100'}`}>
          <BookOpen className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{enrollment.enrollment_number}</p>
          <p className="text-xs text-slate-500 capitalize">{enrollment.payment_plan} payment</p>
        </div>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 ml-auto shrink-0" />}
      </div>
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PortalPaymentsPage() {
  const [enrollments, setEnrollments] = useState<EnrollmentApiResponse[]>([])
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null)
  const [paymentsByEnrollment, setPaymentsByEnrollment] = useState<Record<string, PaymentApiResponse[]>>({})
  const [breakdownByEnrollment, setBreakdownByEnrollment] = useState<Record<string, InstallmentBreakdownApiResponse>>({})
  const [receipts, setReceipts] = useState<ReceiptApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const myEnrollments = await apiGetMyEnrollments()
      if (!myEnrollments || myEnrollments.length === 0) { setIsLoading(false); return }
      setEnrollments(myEnrollments)

      // Default: select first enrollment
      const defaultId = myEnrollments[0].id
      setSelectedEnrollmentId((prev) => prev ?? defaultId)

      // Load payments + breakdowns for all enrollments in parallel
      const results = await Promise.all(
        myEnrollments.map(async (e) => {
          const [pmts, breakdown] = await Promise.all([
            apiGetPaymentsForEnrollment(e.id).catch(() => [] as PaymentApiResponse[]),
            apiGetInstallmentBreakdown(e.id).catch(() => null),
          ])
          return { id: e.id, pmts, breakdown }
        })
      )

      const pmtMap: Record<string, PaymentApiResponse[]> = {}
      const bdMap: Record<string, InstallmentBreakdownApiResponse> = {}
      results.forEach(({ id, pmts, breakdown }) => {
        pmtMap[id] = Array.isArray(pmts) ? pmts : []
        if (breakdown) bdMap[id] = breakdown
      })
      setPaymentsByEnrollment(pmtMap)
      setBreakdownByEnrollment(bdMap)

      // Load all receipts for current student (small set)
      try {
        const allReceipts = await apiGetReceipts()
        setReceipts(Array.isArray(allReceipts?.items) ? allReceipts.items : [])
      } catch { /* ignore */ }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load payment data.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId) ?? null
  const payments = selectedEnrollmentId ? (paymentsByEnrollment[selectedEnrollmentId] ?? []) : []
  const breakdown = selectedEnrollmentId ? (breakdownByEnrollment[selectedEnrollmentId] ?? null) : null

  const remainingBalance = breakdown
    ? breakdown.remaining_balance
    : selectedEnrollment
      ? Math.max(0, (selectedEnrollment.total_fee_at_enrollment || 0) - (selectedEnrollment.amount_paid || 0))
      : 0

  const isMaxReached = payments.length >= MAX_INSTALLMENTS
  const isFullyPaid = remainingBalance <= 0
  const canMakePayment = selectedEnrollment && !isMaxReached && !isFullyPaid

  function handleSuccess() {
    setShowForm(false)
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">Payments & Installments</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Track your course fee, view receipts, and submit installment slips
          </p>
        </div>

        {selectedEnrollment && (
          <button
            onClick={() => setShowForm((v) => !v)}
            disabled={!canMakePayment}
            title={
              isFullyPaid ? 'Course fee fully paid' : isMaxReached ? 'Maximum installments reached' : ''
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <CreditCard className="w-4 h-4" />
            Make Installment Payment
            {showForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Enrollment selector — shown only when student has multiple enrollments */}
      {enrollments.length > 1 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" /> Select Enrollment
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {enrollments.map((e) => (
              <EnrollmentCard
                key={e.id}
                enrollment={e}
                isSelected={e.id === selectedEnrollmentId}
                onClick={() => { setSelectedEnrollmentId(e.id); setShowForm(false) }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fee summary cards */}
      {selectedEnrollment && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Course Fee</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {formatCurrency(breakdown?.total_fee ?? selectedEnrollment?.total_fee_at_enrollment ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount Paid</p>
              <p className="text-lg font-bold text-green-700 mt-0.5">
                {formatCurrency(breakdown?.total_paid ?? selectedEnrollment?.amount_paid ?? 0)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${remainingBalance > 0 ? 'bg-amber-100' : 'bg-green-100'}`}>
              {remainingBalance > 0
                ? <TrendingDown className="w-5 h-5 text-amber-600" />
                : <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Remaining Balance</p>
              <p className={`text-lg font-bold mt-0.5 ${remainingBalance > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                {formatCurrency(remainingBalance)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status banners */}
      {isFullyPaid && !isLoading && selectedEnrollment && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span><strong>Course fee fully settled!</strong> No further payments are needed for this enrollment.</span>
        </div>
      )}
      {isMaxReached && !isFullyPaid && !isLoading && selectedEnrollment && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Maximum installments reached (3/3).</strong> Please contact the institute if you need assistance with the remaining balance.
          </span>
        </div>
      )}

      {/* Inline payment form */}
      {showForm && selectedEnrollment && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-md overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800">New Installment Payment</h2>
              <p className="text-xs text-slate-500">
                Installment {payments.length + 1} of {MAX_INSTALLMENTS} · Remaining: {formatCurrency(remainingBalance)}
              </p>
            </div>
          </div>
          <div className="p-6">
            <PaymentForm
              enrollment={selectedEnrollment}
              existingPayments={payments}
              remainingBalance={remainingBalance}
              onSuccess={handleSuccess}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Payment records */}
      {selectedEnrollment && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Payment Records</h2>
            <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-full">
              {payments.length} / {MAX_INSTALLMENTS} installments
            </span>
          </div>
          <StudentPaymentsTable payments={payments} receipts={receipts} isLoading={isLoading} />
        </div>
      )}

      {!selectedEnrollment && !isLoading && (
        <div className="py-16 text-center text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="text-sm">No active enrollments found.</p>
        </div>
      )}
    </div>
  )
}
