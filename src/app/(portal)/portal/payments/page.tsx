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
  ExternalLink, Eye, BookOpen, RefreshCw,
} from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { apiGetReceipts } from '@/lib/api/receipts'
import { useTranslation } from '@/lib/i18n/useTranslation'

const MAX_INSTALLMENTS = 3

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Success Card (shown after payment submitted — stays until OK clicked) ──────

function SuccessCard({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-5 py-10 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-600" />
      </div>
      <div>
        <p className="font-bold text-slate-800 text-lg">{t.payments.paymentSuccessTitle}</p>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          {t.payments.paymentSuccessMessage}
        </p>
      </div>
      <div className="mt-1 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-sm text-amber-800 max-w-sm w-full">
        <p className="font-semibold mb-1">{t.payments.whatHappensNext}</p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-amber-700">
          <li>{t.payments.step1}</li>
          <li>{t.payments.step2}</li>
          <li>{t.payments.step3}</li>
        </ol>
      </div>
      <button
        onClick={onDismiss}
        className="mt-2 px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm cursor-pointer"
      >
        {t.common.okGotIt}
      </button>
    </div>
  )
}

// ── Inline Payment Form ───────────────────────────────────────────────────────

interface PaymentFormProps {
  enrollment: EnrollmentApiResponse
  existingPayments: PaymentApiResponse[]
  remainingBalance: number
  onPaymentSubmitted?: (payment: PaymentApiResponse, receipt: ReceiptApiResponse) => Promise<void> | void
  onSuccess: () => void
  onCancel: () => void
}

function PaymentForm({
  enrollment,
  existingPayments,
  remainingBalance,
  onPaymentSubmitted,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const { t, isSinhala } = useTranslation()
  const currencyLabel = isSinhala ? 'රු.' : 'LKR'

  // Exclude advance deposits (installment_number=0) — they reduce balance but don't use a slot
  const regularPayments = existingPayments.filter((p) => p.installment_number > 0)
  const nextInstallment = regularPayments.length + 1
  const remainingCount = Math.max(1, MAX_INSTALLMENTS - regularPayments.length)
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
      setFormError('Please enter a valid amount greater than 0.')
      return
    }
    if (numAmount > remainingBalance + 0.01) {
      setFormError(`Amount cannot exceed the remaining balance of ${formatCurrency(remainingBalance, currencyLabel)}.`)
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
      const uploadedReceipt = await apiUploadReceipt(payment.id, file)

      if (onPaymentSubmitted) {
        try {
          await onPaymentSubmitted(payment, uploadedReceipt)
        } catch {
          // non-blocking for success screen display
        }
      }

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
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">{t.payments.makePayment}</p>
          <p className="font-bold text-slate-800 text-base mt-0.5">
            {t.payments.installmentNumber} #{nextInstallment} / {MAX_INSTALLMENTS}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{t.payments.outstandingBalance}</p>
          <p className="font-bold text-slate-800">{formatCurrency(remainingBalance, currencyLabel)}</p>
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
            {t.payments.amountToPay} <span className="text-red-500">*</span>
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
            <p className="text-xs text-red-600 mt-1">{t.payments.outstandingBalance} ({formatCurrency(remainingBalance, currencyLabel)})</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            {t.payments.bankReference} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bankReferenceNo}
            onChange={(e) => setBankReferenceNo(e.target.value)}
            required
            placeholder={t.payments.bankReferencePlaceholder}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Bank Name + Branch */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            {t.payments.bankName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            required
            placeholder={t.payments.bankNamePlaceholder}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            {t.payments.branchName} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            required
            placeholder={t.payments.branchNamePlaceholder}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
          />
        </div>
      </div>

      {/* Transfer Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            {t.payments.transferDate} <span className="text-red-500">*</span>
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
          {t.payments.uploadSlip} <span className="text-red-500">*</span>
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
              <p className="text-sm font-semibold text-slate-700">{t.payments.dragDropHint} <span className="underline text-amber-600">{t.payments.browseFiles}</span></p>
              <p className="text-xs text-slate-400">{t.payments.fileRequirements}</p>
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
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
        >
          <X className="w-4 h-4" /> {t.common.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting || amountExceeds}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t.payments.submittingPayment}</>
          ) : (
            <><Upload className="w-4 h-4" /> {t.payments.submitPayment}</>
          )}
        </button>
      </div>
    </form>
  )
}

// ── Payment Records Table (Student View) ──────────────────────────────────────

function paymentStatusLabel(status: string, t: any) {
  const labels: Record<string, string> = {
    pending: t.common.statusPending,
    under_review: t.common.statusUnderReview,
    completed: t.common.statusCompleted,
    rejected: t.common.statusRejected,
    refunded: 'Refunded',
  }
  return labels[status] ?? status
}

interface SlipViewerProps {
  paymentId: string
  receipts: ReceiptApiResponse[]
}

function SlipViewerButton({ paymentId, receipts }: SlipViewerProps) {
  const { t } = useTranslation()
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
      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Eye className="w-3 h-3" />}
      {t.payments.viewReceipt}
    </button>
  )
}

interface StudentPaymentsTableProps {
  payments: PaymentApiResponse[]
  receipts: ReceiptApiResponse[]
  isLoading: boolean
}

function StudentPaymentsTable({ payments, receipts, isLoading }: StudentPaymentsTableProps) {
  const { t, isSinhala } = useTranslation()
  const currencyLabel = isSinhala ? 'රු.' : 'LKR'

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-32">{t.payments.receiptCol}</TableHead>
            <TableHead className="min-w-24">{t.payments.installmentCol}</TableHead>
            <TableHead className="min-w-36">{t.payments.amountCol}</TableHead>
            <TableHead className="min-w-32">{t.payments.dueDateCol}</TableHead>
            <TableHead className="min-w-36">{t.common.status}</TableHead>
            <TableHead className="min-w-36">{t.payments.paidDateCol}</TableHead>
            <TableHead className="min-w-28">{t.payments.receiptCol}</TableHead>
            <TableHead className="min-w-36">{t.common.actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4 animate-pulse" /> {t.common.loading}
                  </span>
                ) : t.payments.noPaymentsYet}
              </TableCell>
            </TableRow>
          ) : (
            payments.map((p) => (
              <TableRow key={p.id} className="align-middle">
                <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                <TableCell className="text-center">
                  {p.installment_number === 0
                    ? <span className="text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">{t.payments.advanceDeposit}</span>
                    : `${p.installment_number} / ${p.total_installments}`
                  }
                </TableCell>
                <TableCell className="font-semibold">
                  {currencyLabel} {p.amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-sm">{formatDate(p.due_date)}</TableCell>
                <TableCell>
                  <StatusBadge status={p.payment_status} />
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {paymentStatusLabel(p.payment_status, t)}
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
                  {p.payment_status === 'rejected' || (p.payment_status as string) === 'reject' ? (
                    <a
                      href={`/portal/payments/${p.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {t.payments.uploadSlip}
                    </a>
                  ) : p.payment_status === 'pending' ? (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      title="Upload slip is disabled while payment is pending"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg cursor-not-allowed opacity-60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {t.payments.uploadSlip}
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
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
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${isSelected
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
          <p className="text-xs text-slate-500 capitalize">{enrollment.payment_plan === 'full' ? t.payments.planFull : t.payments.planInstallment}</p>
        </div>
        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 ml-auto shrink-0" />}
      </div>
    </button>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PortalPaymentsPage() {
  const { t, isSinhala } = useTranslation()
  const currencyLabel = isSinhala ? 'රු.' : 'LKR'

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

  // Only count regular installments (installment_number > 0) toward the 3-slot limit
  const regularPayments = selectedEnrollmentId
    ? (paymentsByEnrollment[selectedEnrollmentId] ?? []).filter((p) => p.installment_number > 0)
    : []
  const isMaxReached = regularPayments.length >= MAX_INSTALLMENTS
  const isFullyPaid = remainingBalance <= 0
  const canMakePayment = selectedEnrollment && !isMaxReached && !isFullyPaid

  const handlePaymentSubmitted = async (newPayment: PaymentApiResponse, newReceipt: ReceiptApiResponse) => {
    // 1. Optimistic update so the table immediately has the new row without delay
    if (selectedEnrollmentId) {
      setPaymentsByEnrollment((prev) => {
        const existing = prev[selectedEnrollmentId] ?? []
        if (existing.some((p) => p.id === newPayment.id)) return prev
        return {
          ...prev,
          [selectedEnrollmentId]: [newPayment, ...existing],
        }
      })
    }
    if (newReceipt) {
      setReceipts((prev) => {
        if (prev.some((r) => r.id === newReceipt.id)) return prev
        return [newReceipt, ...prev]
      })
    }

    // 2. Fetch authoritative fresh data directly from DB
    await loadData()
  }

  async function handleSuccess() {
    setShowForm(false)
    await loadData()
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800">{t.payments.title}</h1>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            {t.payments.subtitle}
          </p>
        </div>

        {selectedEnrollment && (
          <button
            onClick={() => setShowForm((v) => !v)}
            disabled={!canMakePayment}
            title={
              isFullyPaid ? 'Course fee fully paid' : isMaxReached ? 'Maximum installments reached' : ''
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            {t.payments.makePayment}
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
            <ExternalLink className="w-3.5 h-3.5" /> {t.common.filter}
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.payments.totalFee}</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">
                {formatCurrency(breakdown?.total_fee ?? selectedEnrollment?.total_fee_at_enrollment ?? 0, currencyLabel)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.payments.totalPaid}</p>
              <p className="text-lg font-bold text-green-700 mt-0.5">
                {formatCurrency(breakdown?.total_paid ?? selectedEnrollment?.amount_paid ?? 0, currencyLabel)}
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
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t.payments.outstandingBalance}</p>
              <p className={`text-lg font-bold mt-0.5 ${remainingBalance > 0 ? 'text-amber-700' : 'text-green-700'}`}>
                {formatCurrency(remainingBalance, currencyLabel)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status banners */}
      {isFullyPaid && !isLoading && selectedEnrollment && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
          <span><strong>{t.payments.slipApproved}!</strong> {t.common.statusCompleted}.</span>
        </div>
      )}
      {isMaxReached && !isFullyPaid && !isLoading && selectedEnrollment && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>{t.courses.maxInstallments} (3/3).</strong>
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
              <h2 className="text-sm font-bold text-slate-800">{t.payments.paymentFormTitle}</h2>
              <p className="text-xs text-slate-500">
                {t.payments.installmentNumber} {regularPayments.length + 1} / {MAX_INSTALLMENTS} · {t.payments.outstandingBalance}: {formatCurrency(remainingBalance, currencyLabel)}
              </p>
            </div>
          </div>
          <div className="p-6">
            <PaymentForm
              enrollment={selectedEnrollment}
              existingPayments={payments}
              remainingBalance={remainingBalance}
              onPaymentSubmitted={handlePaymentSubmitted}
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
            <h2 className="text-sm font-semibold text-slate-700">{t.payments.paymentHistory}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2.5 py-1 rounded-full">
                {regularPayments.length} / {MAX_INSTALLMENTS} {t.payments.installmentNumber}
              </span>
              <button
                type="button"
                onClick={() => loadData()}
                disabled={isLoading}
                title="Refresh payments"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            </div>
          </div>
          <StudentPaymentsTable payments={payments} receipts={receipts} isLoading={isLoading} />
        </div>
      )}

      {!selectedEnrollment && !isLoading && (
        <div className="py-16 text-center text-slate-400">
          <CreditCard className="w-10 h-10 mx-auto mb-4 opacity-40" />
          <p className="text-sm">{t.courses.emptyDesc}</p>
        </div>
      )}
    </div>
  )
}
