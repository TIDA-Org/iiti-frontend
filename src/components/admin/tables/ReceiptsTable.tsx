'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ReceiptApiResponse, ReceiptVerifyPayload } from '@/types/receipt'
import { InstallmentBreakdownApiResponse, InstallmentSchedule } from '@/types/payment'
import { apiGetInstallmentBreakdown } from '@/lib/api/payments'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  AlertCircle,
  ExternalLink,
  X,
  Save,
  FileEdit,
  RotateCcw,
  User,
  Calendar,
  Layers,
  Check,
  AlertTriangle,
  Info,
  ShieldCheck,
} from 'lucide-react'
import { apiVerifyReceipt, apiGetReceiptSignedUrl, apiUpdateReceipt } from '@/lib/api/receipts'
import { toast } from 'sonner'

export interface ReceiptsTableProps {
  receipts: ReceiptApiResponse[]
  isLoading?: boolean
  hideAction?: boolean
  onReceiptUpdated?: (updated: ReceiptApiResponse) => void
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateOnly(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatLkr(amount: number | null | undefined) {
  if (amount == null) return '—'
  return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ── Shared Installment Breakdown Component ──────────────────────────────────

interface InstallmentBreakdownSectionProps {
  breakdown: InstallmentBreakdownApiResponse | null
  isLoading: boolean
  error: string | null
  targetInstallmentNumber: number
  amountOnSlip?: string
  onApplyExpectedAmount?: (amount: number) => void
  readOnly?: boolean
}

function InstallmentBreakdownSection({
  breakdown,
  isLoading,
  error,
  targetInstallmentNumber,
  amountOnSlip,
  onApplyExpectedAmount,
  readOnly = false,
}: InstallmentBreakdownSectionProps) {
  // Ensure we always have 3 installment rows to display even if DB slots were not seeded yet
  const displayedInstallments: InstallmentSchedule[] = useMemo(() => {
    if (breakdown?.installments && breakdown.installments.length > 0) {
      return breakdown.installments
    }
    // Fallback: If breakdown has total_fee but installments array is empty
    if (breakdown && breakdown.total_fee > 0) {
      const totalFee = breakdown.total_fee
      const totalPaid = breakdown.total_paid || 0
      const slotAmount = Math.round((totalFee / 3) * 100) / 100
      const slot3Amount = Math.round((totalFee - slotAmount * 2) * 100) / 100
      return [
        {
          installment_number: 1,
          amount_due: slotAmount,
          expected_amount: slotAmount,
          due_date: null,
          status:
            totalPaid >= slotAmount
              ? 'paid'
              : targetInstallmentNumber === 1
                ? 'under_review'
                : 'pending',
          paid_amount: totalPaid >= slotAmount ? slotAmount : null,
        },
        {
          installment_number: 2,
          amount_due: slotAmount,
          expected_amount: slotAmount,
          due_date: null,
          status:
            totalPaid >= slotAmount * 2
              ? 'paid'
              : targetInstallmentNumber === 2
                ? 'under_review'
                : 'pending',
          paid_amount: totalPaid >= slotAmount * 2 ? slotAmount : null,
        },
        {
          installment_number: 3,
          amount_due: slot3Amount,
          expected_amount: slot3Amount,
          due_date: null,
          status:
            totalPaid >= totalFee
              ? 'paid'
              : targetInstallmentNumber === 3
                ? 'under_review'
                : 'pending',
          paid_amount: totalPaid >= totalFee ? slot3Amount : null,
        },
      ]
    }
    return []
  }, [breakdown, targetInstallmentNumber])

  // Locate the target slot for this receipt
  const targetSlot = displayedInstallments.find(
    (i) => i.installment_number === targetInstallmentNumber
  )
  const expectedAmount =
    targetSlot?.expected_amount ??
    targetSlot?.amount_due ??
    (breakdown ? Math.round((breakdown.total_fee / 3) * 100) / 100 : null)

  // Verification calculations
  const parsedSlipAmount = amountOnSlip ? parseFloat(amountOnSlip) : NaN
  const hasValidSlipAmount = !isNaN(parsedSlipAmount) && parsedSlipAmount >= 0
  const amountDifference =
    hasValidSlipAmount && expectedAmount != null
      ? Math.round((parsedSlipAmount - expectedAmount) * 100) / 100
      : null
  const isAmountExactMatch =
    amountDifference !== null && Math.abs(amountDifference) < 0.01
  const isUnderpaid = amountDifference !== null && amountDifference < -0.01
  const isOverpaid = amountDifference !== null && amountDifference > 0.01

  return (
    <div className="space-y-3">
      {/* Financial overview chips */}
      {breakdown && (
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2">
            <span className="text-[11px] text-slate-500 font-medium block">Total Course Fee</span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              {formatLkr(breakdown.total_fee)}
            </span>
          </div>
          <div className="bg-green-50/80 border border-green-200/80 rounded-lg p-2">
            <span className="text-[11px] text-green-700 font-medium block">Total Paid So Far</span>
            <span className="font-bold text-green-800 text-xs sm:text-sm">
              {formatLkr(breakdown.total_paid)}
            </span>
          </div>
          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2">
            <span className="text-[11px] text-amber-700 font-medium block">Outstanding Balance</span>
            <span className="font-bold text-amber-800 text-xs sm:text-sm">
              {formatLkr(breakdown.remaining_balance)}
            </span>
          </div>
        </div>
      )}

      {/* Breakdown Table Card */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              All 3 Installment Breakdowns
            </h4>
          </div>
          {expectedAmount != null && (
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
              Target: Slot #{targetInstallmentNumber} ({formatLkr(expectedAmount)})
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
            <span className="text-xs">Loading installment schedule…</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-xs text-red-500">
            <p>{error}</p>
          </div>
        ) : displayedInstallments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-[11px] text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Installment</th>
                  <th className="px-3 py-2 text-left font-semibold">Amount Due (Expected)</th>
                  <th className="px-3 py-2 text-left font-semibold">Due Date</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">Paid / Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedInstallments.map((inst) => {
                  const isCurrentTarget = inst.installment_number === targetInstallmentNumber
                  const slotExpected = inst.expected_amount ?? inst.amount_due
                  return (
                    <tr
                      key={inst.installment_number}
                      className={
                        isCurrentTarget
                          ? 'bg-amber-50/70 font-medium'
                          : 'hover:bg-slate-50/50'
                      }
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-800">
                            Installment #{inst.installment_number}
                          </span>
                          {isCurrentTarget && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white tracking-wide uppercase">
                              This Slip
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800">
                        {formatLkr(slotExpected)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {inst.due_date ? (
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatDateOnly(inst.due_date)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : inst.status === 'under_review'
                                ? 'bg-blue-100 text-blue-800'
                                : inst.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {inst.status === 'under_review' ? 'Under Review' : inst.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                        {inst.paid_amount != null
                          ? formatLkr(inst.paid_amount)
                          : isCurrentTarget && hasValidSlipAmount
                            ? `${formatLkr(parsedSlipAmount)} (slip)`
                            : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-xs text-slate-500 text-center">
            No installment schedule records found for this enrollment.
          </div>
        )}
      </div>

      {/* Verification Comparison Banner (Interactive Review Mode) */}
      {!readOnly && expectedAmount != null && (
        <div>
          {isAmountExactMatch ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-900">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Amount Match Verified:</span> Slip amount (
                {formatLkr(parsedSlipAmount)}) exactly matches the expected amount for Installment #
                {targetInstallmentNumber}.
              </div>
            </div>
          ) : isUnderpaid ? (
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Underpayment Notice:</span> Slip amount (
                  {formatLkr(parsedSlipAmount)}) is{' '}
                  <span className="font-bold underline text-amber-800">
                    {formatLkr(Math.abs(amountDifference!))} less
                  </span>{' '}
                  than the expected installment amount of {formatLkr(expectedAmount)}.
                </div>
              </div>
              {onApplyExpectedAmount && (
                <button
                  type="button"
                  onClick={() => onApplyExpectedAmount(expectedAmount)}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                >
                  Set to Expected
                </button>
              )}
            </div>
          ) : isOverpaid ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Overpayment Notice:</span> Slip amount (
                {formatLkr(parsedSlipAmount)}) exceeds expected Installment #{targetInstallmentNumber}{' '}
                ({formatLkr(expectedAmount)}) by {formatLkr(amountDifference!)}. The excess will
                automatically decrease remaining installment balances upon approval.
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span>
                Expected Installment #{targetInstallmentNumber}:{' '}
                <strong className="text-slate-800">{formatLkr(expectedAmount)}</strong>. Enter or
                confirm the amount visible on the bank slip below.
              </span>
              {onApplyExpectedAmount && (
                <button
                  type="button"
                  onClick={() => onApplyExpectedAmount(expectedAmount)}
                  className="shrink-0 px-2.5 py-1 text-[11px] font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-colors"
                >
                  Fill Expected
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Review Modal ────────────────────────────────────────────────────────────

interface ReviewModalProps {
  receipt: ReceiptApiResponse
  onClose: () => void
  onUpdated: (updated: ReceiptApiResponse) => void
}

function ReviewModal({ receipt, onClose, onUpdated }: ReviewModalProps) {
  const [currentReceipt, setCurrentReceipt] = useState<ReceiptApiResponse>(receipt)
  // Pre-fill bank ref from the DB value the student submitted
  const [bankRef, setBankRef] = useState(receipt.bank_reference_no ?? '')
  // Amount on slip (prefilled with receipt.amount_on_slip or empty)
  const [amountOnSlip, setAmountOnSlip] = useState(
    receipt.amount_on_slip != null ? String(receipt.amount_on_slip) : ''
  )
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingAmount, setIsSavingAmount] = useState(false)

  // Installment breakdown state
  const [breakdown, setBreakdown] = useState<InstallmentBreakdownApiResponse | null>(null)
  const [breakdownLoading, setBreakdownLoading] = useState(false)
  const [breakdownError, setBreakdownError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentReceipt(receipt)
    setBankRef(receipt.bank_reference_no ?? '')
    setAmountOnSlip(receipt.amount_on_slip != null ? String(receipt.amount_on_slip) : '')
  }, [receipt])

  // Load installment breakdown for student's enrollment
  useEffect(() => {
    let active = true
    if (!currentReceipt.enrollment_id) {
      setBreakdown(null)
      return
    }

    setBreakdownLoading(true)
    setBreakdownError(null)

    apiGetInstallmentBreakdown(currentReceipt.enrollment_id)
      .then((data) => {
        if (active) setBreakdown(data)
      })
      .catch(() => {
        if (active) setBreakdownError('Could not load student installment breakdown.')
      })
      .finally(() => {
        if (active) setBreakdownLoading(false)
      })

    return () => {
      active = false
    }
  }, [currentReceipt.enrollment_id])

  // State for loading the signed image URL
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [slipLoading, setSlipLoading] = useState(false)
  const [slipError, setSlipError] = useState<string | null>(null)

  const isPdf = currentReceipt.file_url?.match(/\.pdf$/i)

  const loadSignedUrl = useCallback(async () => {
    setSlipLoading(true)
    setSlipError(null)
    try {
      const { signed_url } = await apiGetReceiptSignedUrl(currentReceipt.id)
      setSignedUrl(signed_url)
    } catch {
      setSlipError('Could not load image. Please try again.')
    } finally {
      setSlipLoading(false)
    }
  }, [currentReceipt.id])

  useEffect(() => {
    loadSignedUrl()
  }, [loadSignedUrl])

  const hasRejectionReason = rejectionReason.trim().length > 0

  // Calculate target slot number
  const targetInstallmentNumber =
    currentReceipt.installment_number ??
    breakdown?.installments.find((i) => i.status === 'under_review' || i.status === 'pending')
      ?.installment_number ??
    1

  const handleSaveAmount = async () => {
    let parsedAmount: number | undefined = undefined
    if (amountOnSlip.trim() !== '') {
      parsedAmount = parseFloat(amountOnSlip)
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        toast.error('Please enter a valid amount.')
        return
      }
    }

    setIsSavingAmount(true)
    try {
      const updated = await apiUpdateReceipt(currentReceipt.id, {
        amount_on_slip: parsedAmount,
        bank_reference_no: bankRef.trim() || undefined,
      })
      toast.success('Amount on slip updated successfully.')
      setCurrentReceipt(updated)
      // Notify parent table to update the row in place — does NOT approve or reject
      onUpdated(updated)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update amount on slip.'
      toast.error(message)
    } finally {
      setIsSavingAmount(false)
    }
  }

  const handleVerify = async (isApproved: boolean) => {
    // Block approval when rejection reason is filled
    if (isApproved && hasRejectionReason) {
      toast.error('Clear the Rejection Reason field before approving.')
      return
    }
    if (!isApproved && !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.')
      return
    }

    let parsedAmount: number | undefined = undefined
    if (amountOnSlip.trim() !== '') {
      parsedAmount = parseFloat(amountOnSlip)
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        toast.error('Please enter a valid amount on slip.')
        return
      }
    }

    setIsSubmitting(true)
    try {
      const payload: ReceiptVerifyPayload = {
        is_approved: isApproved,
        bank_reference_no: isApproved ? bankRef.trim() || undefined : undefined,
        amount_on_slip: parsedAmount,
        rejection_reason: !isApproved ? rejectionReason.trim() : undefined,
      }
      const updated = await apiVerifyReceipt(currentReceipt.id, payload)
      toast.success(isApproved ? 'Receipt approved successfully!' : 'Receipt rejected.')
      onUpdated(updated)
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to verify receipt.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-slate-800">Review Bank Slip</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Installment #{targetInstallmentNumber} of {currentReceipt.total_installments || 3}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Receipt ID: {currentReceipt.receipt_number || currentReceipt.id.slice(0, 8) + '…'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Student & Course Context Header Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm">
                    {currentReceipt.student_name || 'Registered Student'}
                  </span>
                  {currentReceipt.student_number && (
                    <span className="font-mono text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                      {currentReceipt.student_number}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  {currentReceipt.course_name || 'Course'}
                  {currentReceipt.enrollment_number ? ` · ${currentReceipt.enrollment_number}` : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                Slip Date: {formatDateOnly(currentReceipt.transfer_date) || formatDate(currentReceipt.uploaded_at)}
              </span>
            </div>
          </div>

          {/* Two-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Bank Deposit Slip Preview + Bank metadata */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 flex flex-col items-center justify-center min-h-64 p-3 relative">
                {slipLoading && (
                  <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                    <Loader2 className="w-7 h-7 animate-spin" />
                    <span className="text-sm">Loading slip image…</span>
                  </div>
                )}
                {slipError && !slipLoading && (
                  <div className="flex flex-col items-center gap-2 py-12 text-red-500 text-center">
                    <AlertCircle className="w-7 h-7" />
                    <span className="text-xs">{slipError}</span>
                    <button
                      onClick={loadSignedUrl}
                      className="text-xs text-amber-600 hover:underline mt-1"
                    >
                      Retry
                    </button>
                  </div>
                )}
                {signedUrl && !slipLoading && !isPdf && (
                  <div className="flex flex-col items-center gap-2 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={signedUrl}
                      alt="Bank slip"
                      className="max-h-80 w-auto object-contain rounded-lg shadow-xs"
                    />
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-amber-700 hover:text-amber-800 hover:underline mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open full slip in new tab
                    </a>
                  </div>
                )}
                {signedUrl && !slipLoading && isPdf && (
                  <div className="flex flex-col items-center gap-2 text-slate-600 py-8">
                    <FileText className="w-12 h-12 text-red-500" />
                    <span className="text-sm font-medium">{currentReceipt.original_name || 'Bank_Slip.pdf'}</span>
                    <a
                      href={signedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors mt-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open PDF Slip
                    </a>
                  </div>
                )}
              </div>

              {/* Bank details from student submission */}
              <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50 rounded-xl border border-slate-200/80 p-3.5">
                <div>
                  <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mb-0.5">
                    Uploaded At
                  </p>
                  <p className="text-slate-700">{formatDate(currentReceipt.uploaded_at)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mb-0.5">
                    File Size
                  </p>
                  <p className="text-slate-700">
                    {currentReceipt.file_size_kb ? `${currentReceipt.file_size_kb} KB` : '—'}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mb-0.5">
                    Transfer Date
                  </p>
                  <p className="text-slate-700">{formatDateOnly(currentReceipt.transfer_date)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mb-0.5">
                    Amount on Slip
                  </p>
                  <p className="font-semibold text-slate-800">
                    {formatLkr(currentReceipt.amount_on_slip)}
                  </p>
                </div>
                {currentReceipt.bank_reference_no && (
                  <div className="col-span-2">
                    <p className="font-semibold text-slate-500 uppercase text-[10px] tracking-wide mb-0.5">
                      Bank Ref (student submitted)
                    </p>
                    <p className="font-mono font-semibold text-slate-800 text-xs">
                      {currentReceipt.bank_reference_no}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: 3-Installment breakdown schedule + Amount Verification + Rejection */}
            <div className="lg:col-span-7 space-y-4">
              {/* Installment Breakdown Schedule (All 3 Installments) */}
              <InstallmentBreakdownSection
                breakdown={breakdown}
                isLoading={breakdownLoading}
                error={breakdownError}
                targetInstallmentNumber={targetInstallmentNumber}
                amountOnSlip={amountOnSlip}
                onApplyExpectedAmount={(amount) => setAmountOnSlip(String(amount))}
              />

              {/* Editable verification fields (Admin can verify & edit amount on slip) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                      <FileEdit className="w-3.5 h-3.5 text-amber-600" />
                      Verify & Edit Amount on Slip
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Confirm the amount seen on the bank slip. You can update it before approving.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAmount}
                    disabled={isSavingAmount || isSubmitting}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shadow-xs shrink-0 cursor-pointer"
                    title="Only updates the Amount on Slip in database without approving/rejecting"
                  >
                    {isSavingAmount ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Amount</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Amount on Slip */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Amount on Slip (LKR)
                      </label>
                      {currentReceipt.amount_on_slip != null &&
                        amountOnSlip !== '' &&
                        parseFloat(amountOnSlip) !== currentReceipt.amount_on_slip && (
                          <button
                            type="button"
                            onClick={() => setAmountOnSlip(String(currentReceipt.amount_on_slip))}
                            className="text-[11px] text-amber-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Reset to saved amount"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset
                          </button>
                        )}
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-semibold text-slate-400 select-none">
                        LKR
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={amountOnSlip}
                        onChange={(e) => setAmountOnSlip(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-12 pr-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      />
                    </div>
                    {currentReceipt.amount_on_slip != null &&
                      amountOnSlip !== '' &&
                      parseFloat(amountOnSlip) !== currentReceipt.amount_on_slip && (
                        <p className="text-[11px] text-amber-600 mt-1">
                          Current recorded: {formatLkr(currentReceipt.amount_on_slip)}
                        </p>
                      )}
                  </div>

                  {/* Confirm Bank Reference No */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                        Confirm Bank Reference No
                      </label>
                      {currentReceipt.bank_reference_no &&
                        bankRef !== currentReceipt.bank_reference_no && (
                          <button
                            type="button"
                            onClick={() => setBankRef(currentReceipt.bank_reference_no ?? '')}
                            className="text-[11px] text-amber-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                            title="Reset to saved reference"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            Reset
                          </button>
                        )}
                    </div>
                    <input
                      type="text"
                      value={bankRef}
                      onChange={(e) => setBankRef(e.target.value)}
                      placeholder="e.g. BOC-2026-TXN-88741"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Rejection Reason — must be empty to approve */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  Rejection Reason{' '}
                  <span className="text-slate-400 normal-case">
                    (required to reject · must be empty to approve)
                  </span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  placeholder="e.g. Deposit amount does not match installment fee, slip is unreadable, etc."
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white resize-none transition-colors ${
                    hasRejectionReason
                      ? 'border-red-300 focus:ring-red-400'
                      : 'border-slate-200 focus:ring-amber-500'
                  }`}
                />
                {hasRejectionReason && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Approval is blocked while a rejection reason
                    is entered.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleVerify(false)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              {isSubmitting ? 'Rejecting…' : 'Reject Receipt'}
            </button>
            <button
              onClick={() => handleVerify(true)}
              disabled={isSubmitting || hasRejectionReason}
              title={hasRejectionReason ? 'Clear rejection reason to approve' : ''}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? 'Approving…' : 'Approve Receipt & Update Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── View Receipt Modal (Read-Only Slip Viewer with 3-Installment Schedule) ──

interface ViewReceiptModalProps {
  receipt: ReceiptApiResponse
  onClose: () => void
}

function ViewReceiptModal({ receipt, onClose }: ViewReceiptModalProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [slipLoading, setSlipLoading] = useState(false)
  const [slipError, setSlipError] = useState<string | null>(null)

  // Installment breakdown state for read-only viewer
  const [breakdown, setBreakdown] = useState<InstallmentBreakdownApiResponse | null>(null)
  const [breakdownLoading, setBreakdownLoading] = useState(false)
  const [breakdownError, setBreakdownError] = useState<string | null>(null)

  const isPdf = Boolean(
    receipt.file_url?.match(/\.pdf$/i) ||
    receipt.original_name?.match(/\.pdf$/i)
  )

  const loadSignedUrl = useCallback(async () => {
    setSlipLoading(true)
    setSlipError(null)
    try {
      const { signed_url } = await apiGetReceiptSignedUrl(receipt.id)
      setSignedUrl(signed_url)
    } catch {
      setSlipError('Could not load slip. Please try again.')
    } finally {
      setSlipLoading(false)
    }
  }, [receipt.id])

  useEffect(() => {
    loadSignedUrl()
  }, [loadSignedUrl])

  useEffect(() => {
    let active = true
    if (!receipt.enrollment_id) return

    setBreakdownLoading(true)
    setBreakdownError(null)

    apiGetInstallmentBreakdown(receipt.enrollment_id)
      .then((data) => {
        if (active) setBreakdown(data)
      })
      .catch(() => {
        if (active) setBreakdownError('Could not load student installment breakdown.')
      })
      .finally(() => {
        if (active) setBreakdownLoading(false)
      })

    return () => {
      active = false
    }
  }, [receipt.enrollment_id])

  const targetInstallmentNumber = receipt.installment_number ?? 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-800">Bank Deposit Slip</h2>
              <StatusBadge status={receipt.status} />
              {receipt.installment_number && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Installment #{receipt.installment_number} / {receipt.total_installments || 3}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              {receipt.receipt_number ? `Receipt: ${receipt.receipt_number}` : `ID: ${receipt.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Status info / Rejection alert */}
          {receipt.status === 'rejected' && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Rejection Reason:</span>{' '}
                {receipt.rejection_reason || 'No reason provided.'}
                {receipt.reviewed_at && (
                  <p className="text-red-500 mt-1">
                    Rejected on {formatDate(receipt.reviewed_at)}
                  </p>
                )}
              </div>
            </div>
          )}

          {receipt.status === 'approved' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>
                Verified & Approved
                {receipt.reviewed_at ? ` on ${formatDate(receipt.reviewed_at)}` : ''}
              </span>
            </div>
          )}

          {/* Student Banner */}
          {(receipt.student_name || receipt.course_name) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-500" />
                <div>
                  <span className="font-bold text-slate-800">
                    {receipt.student_name || 'Student'}
                  </span>
                  {receipt.student_number && (
                    <span className="text-slate-400 ml-1.5 font-mono">({receipt.student_number})</span>
                  )}
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {receipt.course_name}
                    {receipt.enrollment_number ? ` · ${receipt.enrollment_number}` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Slip Preview */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 flex flex-col items-center justify-center min-h-64 p-3 relative">
            {slipLoading && (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-sm">Loading receipt slip…</span>
              </div>
            )}
            {slipError && !slipLoading && (
              <div className="flex flex-col items-center gap-2 py-12 text-red-500">
                <AlertCircle className="w-7 h-7" />
                <span className="text-sm">{slipError}</span>
                <button
                  type="button"
                  onClick={loadSignedUrl}
                  className="text-xs text-amber-600 hover:underline mt-1"
                >
                  Retry
                </button>
              </div>
            )}
            {signedUrl && !slipLoading && !isPdf && (
              <div className="flex flex-col items-center gap-2 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={signedUrl}
                  alt="Bank deposit slip"
                  className="max-h-96 w-auto object-contain rounded-lg shadow-xs"
                />
              </div>
            )}
            {signedUrl && !slipLoading && isPdf && (
              <div className="flex flex-col items-center gap-3 py-8 text-slate-600">
                <FileText className="w-14 h-14 text-red-500" />
                <div className="text-center">
                  <p className="text-sm font-semibold">{receipt.original_name ?? 'Deposit_Slip.pdf'}</p>
                  <p className="text-xs text-slate-400">PDF Document</p>
                </div>
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open PDF in New Tab
                </a>
              </div>
            )}
          </div>

          {/* Student 3-Installment Schedule (Read-Only) */}
          {receipt.enrollment_id && (
            <InstallmentBreakdownSection
              breakdown={breakdown}
              isLoading={breakdownLoading}
              error={breakdownError}
              targetInstallmentNumber={targetInstallmentNumber}
              amountOnSlip={receipt.amount_on_slip != null ? String(receipt.amount_on_slip) : undefined}
              readOnly
            />
          )}

          {/* Receipt details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Uploaded At</p>
              <p className="text-slate-700 text-xs">{formatDate(receipt.uploaded_at)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">File Name</p>
              <p className="text-slate-700 text-xs truncate" title={receipt.original_name ?? '—'}>
                {receipt.original_name ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">File Size</p>
              <p className="text-slate-700 text-xs">{receipt.file_size_kb ? `${receipt.file_size_kb} KB` : '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Transfer Date</p>
              <p className="text-slate-700 text-xs">{formatDateOnly(receipt.transfer_date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Amount on Slip</p>
              <p className="font-semibold text-slate-800 text-xs">
                {formatLkr(receipt.amount_on_slip)}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bank Reference</p>
              <p className="font-mono text-xs font-semibold text-slate-800">
                {receipt.bank_reference_no ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl shrink-0">
          <div>
            {signedUrl && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-lg transition-colors shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Full Size
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Receipts Table ──────────────────────────────────────────────────────────

export function ReceiptsTable({
  receipts,
  isLoading = false,
  hideAction = false,
  onReceiptUpdated,
}: ReceiptsTableProps) {
  const [reviewingReceipt, setReviewingReceipt] = useState<ReceiptApiResponse | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptApiResponse | null>(null)

  return (
    <>
      {reviewingReceipt && (
        <ReviewModal
          receipt={reviewingReceipt}
          onClose={() => setReviewingReceipt(null)}
          onUpdated={(updated) => {
            onReceiptUpdated?.(updated)
            // If verified (approved or rejected), close modal.
            // If status is still 'uploaded' (only Amount on Slip was saved), keep modal open with fresh data!
            if (updated.status !== 'uploaded') {
              setReviewingReceipt(null)
            } else {
              setReviewingReceipt(updated)
            }
          }}
        />
      )}

      {viewingReceipt && (
        <ViewReceiptModal
          receipt={viewingReceipt}
          onClose={() => setViewingReceipt(null)}
        />
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-28">Receipt #</TableHead>
              <TableHead className="min-w-36">Student</TableHead>
              <TableHead className="min-w-36">Target Installment</TableHead>
              <TableHead className="min-w-40">File</TableHead>
              <TableHead className="min-w-28">Status</TableHead>
              <TableHead className="min-w-32">Amount (LKR)</TableHead>
              {!hideAction && <TableHead className="min-w-28">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={hideAction ? 6 : 7} className="py-10 text-center text-muted-foreground">
                  {isLoading ? 'Loading receipt queue…' : 'No receipts awaiting review.'}
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((r) => (
                <TableRow key={r.id} className="align-middle">
                  {/* Receipt # */}
                  <TableCell className="font-mono text-xs text-amber-700 font-semibold">
                    {r.receipt_number ?? r.id.slice(0, 8) + '…'}
                  </TableCell>

                  {/* Student Name & Number */}
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs">
                        {r.student_name ?? '—'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {r.student_number || r.enrollment_number || '—'}
                      </p>
                    </div>
                  </TableCell>

                  {/* Target Installment & Course */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                        Installment #{r.installment_number ?? 1} / {r.total_installments ?? 3}
                      </span>
                      {r.course_name && (
                        <span className="text-[11px] text-slate-500 truncate max-w-44" title={r.course_name}>
                          {r.course_name}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* File */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(r)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-amber-600 transition-colors group text-left cursor-pointer"
                      title="Click to view bank slip"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                      <span className="font-medium group-hover:underline truncate max-w-40">
                        {r.original_name ?? 'bank_slip'}
                      </span>
                    </button>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>

                  {/* Amount on Slip */}
                  <TableCell className="text-sm font-semibold text-slate-800">
                    {r.amount_on_slip != null ? formatLkr(r.amount_on_slip) : '—'}
                  </TableCell>

                  {/* Action */}
                  {!hideAction && (
                    <TableCell>
                      {r.status === 'uploaded' ? (
                        <button
                          type="button"
                          onClick={() => setReviewingReceipt(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors shadow-xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Slip
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Slip
                        </button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
