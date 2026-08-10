'use client'

import { useState } from 'react'
import { ReceiptApiResponse, ReceiptVerifyPayload } from '@/types/receipt'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, CheckCircle, XCircle, FileText, Loader2, AlertCircle } from 'lucide-react'
import { apiVerifyReceipt, apiGetReceiptSignedUrl } from '@/lib/api/receipts'
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

// ── Review Modal ────────────────────────────────────────────────────────────

interface ReviewModalProps {
  receipt: ReceiptApiResponse
  onClose: () => void
  onUpdated: (updated: ReceiptApiResponse) => void
}

function ReviewModal({ receipt, onClose, onUpdated }: ReviewModalProps) {
  // Pre-fill bank ref from the DB value the student submitted
  const [bankRef, setBankRef] = useState(receipt.bank_reference_no ?? '')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for loading the signed image URL
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [slipLoading, setSlipLoading] = useState(false)
  const [slipError, setSlipError] = useState<string | null>(null)

  const isPdf = receipt.file_url?.match(/\.pdf$/i)

  async function loadSignedUrl() {
    setSlipLoading(true)
    setSlipError(null)
    try {
      const { signed_url } = await apiGetReceiptSignedUrl(receipt.id)
      setSignedUrl(signed_url)
    } catch {
      setSlipError('Could not load image. Please try again.')
    } finally {
      setSlipLoading(false)
    }
  }

  // Load signed URL immediately on modal open
  if (signedUrl === null && !slipLoading && !slipError) {
    loadSignedUrl()
  }

  const hasRejectionReason = rejectionReason.trim().length > 0

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

    setIsSubmitting(true)
    try {
      const payload: ReceiptVerifyPayload = {
        is_approved: isApproved,
        bank_reference_no: isApproved ? bankRef.trim() || undefined : undefined,
        rejection_reason: !isApproved ? rejectionReason.trim() : undefined,
      }
      const updated = await apiVerifyReceipt(receipt.id, payload)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Review Bank Slip</h2>
            <p className="text-sm text-slate-500 mt-0.5">Receipt ID: {receipt.id.slice(0, 8)}…</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            aria-label="Close"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Slip Preview — uses signed URL */}
          <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center min-h-56">
            {slipLoading && (
              <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-sm">Loading slip…</span>
              </div>
            )}
            {slipError && !slipLoading && (
              <div className="flex flex-col items-center gap-2 py-10 text-red-500">
                <AlertCircle className="w-7 h-7" />
                <span className="text-sm">{slipError}</span>
                <button onClick={loadSignedUrl} className="text-xs text-amber-600 hover:underline mt-1">
                  Retry
                </button>
              </div>
            )}
            {signedUrl && !slipLoading && !isPdf && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={signedUrl}
                alt="Bank slip"
                className="max-h-80 object-contain"
              />
            )}
            {signedUrl && !slipLoading && isPdf && (
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors py-8"
              >
                <FileText className="w-12 h-12" />
                <span className="text-sm font-medium">Open PDF / Document</span>
                <span className="text-xs text-slate-400">{receipt.original_name}</span>
              </a>
            )}
          </div>

          {/* Bank details from student submission */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Uploaded At</p>
              <p className="text-slate-700">{formatDate(receipt.uploaded_at)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">File Size</p>
              <p className="text-slate-700">{receipt.file_size_kb ? `${receipt.file_size_kb} KB` : '—'}</p>
            </div>
            {receipt.transfer_date && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Transfer Date</p>
                <p className="text-slate-700">{formatDateOnly(receipt.transfer_date)}</p>
              </div>
            )}
            {receipt.amount_on_slip != null && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Amount on Slip</p>
                <p className="font-semibold text-slate-800">LKR {receipt.amount_on_slip.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
              </div>
            )}
            {receipt.bank_reference_no && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bank Ref (submitted by student)</p>
                <p className="font-mono font-semibold text-slate-800">{receipt.bank_reference_no}</p>
              </div>
            )}
          </div>

          {/* Confirm bank reference (editable by staff — can correct if needed) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Confirm Bank Reference No <span className="text-slate-400 normal-case">(verify against slip, edit if needed)</span>
            </label>
            <input
              type="text"
              value={bankRef}
              onChange={(e) => setBankRef(e.target.value)}
              placeholder="e.g. BOC-2026-TXN-88741"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>

          {/* Rejection Reason — must be empty to approve */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Rejection Reason{' '}
              <span className="text-slate-400 normal-case">(required to reject · must be empty to approve)</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={2}
              placeholder="e.g. Deposit amount does not match installment fee"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 bg-white resize-none transition-colors ${
                hasRejectionReason
                  ? 'border-red-300 focus:ring-red-400'
                  : 'border-slate-200 focus:ring-red-400'
              }`}
            />
            {hasRejectionReason && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Approval is blocked while a rejection reason is entered.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
          <button
            onClick={() => handleVerify(false)}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            {isSubmitting ? 'Rejecting…' : 'Reject Receipt'}
          </button>
          <button
            onClick={() => handleVerify(true)}
            disabled={isSubmitting || hasRejectionReason}
            title={hasRejectionReason ? 'Clear rejection reason to approve' : ''}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            {isSubmitting ? 'Approving…' : 'Approve Receipt & Update Payment'}
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

  return (
    <>
      {reviewingReceipt && (
        <ReviewModal
          receipt={reviewingReceipt}
          onClose={() => setReviewingReceipt(null)}
          onUpdated={(updated) => {
            onReceiptUpdated?.(updated)
            setReviewingReceipt(null)
          }}
        />
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-32">Receipt #</TableHead>
              <TableHead className="min-w-44">File</TableHead>
              <TableHead className="min-w-36">Status</TableHead>
              <TableHead className="min-w-40">Uploaded At</TableHead>
              <TableHead className="min-w-28">Size</TableHead>
              <TableHead className="min-w-36">Bank Ref No</TableHead>
              <TableHead className="min-w-36">Transfer Date</TableHead>
              {!hideAction && <TableHead className="min-w-28">Action</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {receipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  {isLoading
                    ? 'Loading receipt queue…'
                    : 'No receipts awaiting review.'}
                </TableCell>
              </TableRow>
            ) : (
              receipts.map((r) => (
                <TableRow key={r.id} className="align-middle">
                  <TableCell className="font-mono text-xs text-amber-700 font-semibold">
                    {r.receipt_number ?? r.id.slice(0, 8) + '…'}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      {r.original_name ?? 'bank_slip'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={r.status} />
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(r.uploaded_at)}</TableCell>
                  <TableCell className="text-sm">
                    {r.file_size_kb ? `${r.file_size_kb} KB` : '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {r.bank_reference_no ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDateOnly(r.transfer_date)}
                  </TableCell>
                  {!hideAction && (
                    <TableCell>
                      {r.status === 'uploaded' ? (
                        <button
                          onClick={() => setReviewingReceipt(r)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-amber-500 hover:bg-amber-600 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review Slip
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground capitalize">
                          {r.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                        </span>
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
