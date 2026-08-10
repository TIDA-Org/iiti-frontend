'use client'

import { useState } from 'react'
import { PaymentApiResponse, PaymentUpdatePayload } from '@/types/payment'
import { StatusBadge } from '@/components/shared/StatusBadge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { CreditCard, X, CheckCircle, Edit2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiGetPayment, apiUpdatePayment } from '@/lib/api/payments'
import { toast } from 'sonner'

export interface PaymentsTableProps {
  payments: PaymentApiResponse[]
  isLoading?: boolean
  showUploadAction?: boolean
  onPaymentUpdated?: (updated: PaymentApiResponse) => void
}

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    pending: 'Pending Upload',
    under_review: 'Slip Under Review',
    completed: 'Paid',
    rejected: 'Slip Rejected',
    refunded: 'Refunded',
  }
  return labels[status] ?? status
}

// ── View / Edit Modal ─────────────────────────────────────────────────────────

interface PaymentDetailModalProps {
  payment: PaymentApiResponse
  onClose: () => void
  onUpdated: (updated: PaymentApiResponse) => void
}

function PaymentDetailModal({ payment, onClose, onUpdated }: PaymentDetailModalProps) {
  const [newStatus, setNewStatus] = useState(payment.payment_status)
  const [notes, setNotes] = useState(payment.payment_status === 'completed' ? '' : '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (newStatus === payment.payment_status) { onClose(); return }
    setSaving(true)
    try {
      const payload: PaymentUpdatePayload = { payment_status: newStatus as PaymentApiResponse['payment_status'] }
      if (notes.trim()) payload.notes = notes.trim()
      const updated = await apiUpdatePayment(payment.id, payload)
      toast.success('Payment updated successfully.')
      onUpdated(updated)
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update payment.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Payment Details</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-mono">{payment.receipt_number}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 rounded-xl p-4">
            {[
              ['Receipt No', payment.receipt_number],
              ['Enrollment', payment.enrollment_number ?? '—'],
              ['Student No', payment.student_number ?? '—'],
              ['Installment', `${payment.installment_number} / ${payment.total_installments}`],
              ['Amount', formatCurrency(payment.amount, payment.currency)],
              ['Method', payment.payment_method.replace('_', ' ')],
              ['Bank Ref', payment.bank_reference_no ?? '—'],
              ['Bank', payment.bank_name ?? '—'],
              ['Branch', payment.branch_name ?? '—'],
              ['Transfer Date', formatDate(payment.transfer_date)],
              ['Due Date', formatDate(payment.due_date)],
              ['Paid At', formatDate(payment.approved_at)],
              ['Created', formatDate(payment.created_at)],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-slate-700 mt-0.5 font-medium text-sm break-all">{value}</p>
              </div>
            ))}
          </div>

          {/* Status edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Update Status <span className="text-slate-400 normal-case">(staff only)</span>
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as PaymentApiResponse['payment_status'])}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Optional staff note..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Payments Table ─────────────────────────────────────────────────────────────

export function PaymentsTable({
  payments,
  isLoading = false,
  showUploadAction = false,
  onPaymentUpdated,
}: PaymentsTableProps) {
  const [viewingPayment, setViewingPayment] = useState<PaymentApiResponse | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleView = async (p: PaymentApiResponse) => {
    setLoadingId(p.id)
    try {
      // Fetch fresh full detail from backend (includes enriched fields)
      const fresh = await apiGetPayment(p.id)
      setViewingPayment(fresh)
    } catch {
      setViewingPayment(p) // fallback to table data
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <>
      {viewingPayment && (
        <PaymentDetailModal
          payment={viewingPayment}
          onClose={() => setViewingPayment(null)}
          onUpdated={(updated) => {
            onPaymentUpdated?.(updated)
            setViewingPayment(null)
          }}
        />
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-32">Receipt #</TableHead>
              <TableHead className="min-w-32">Enrollment</TableHead>
              <TableHead className="min-w-32">Student No</TableHead>
              <TableHead className="min-w-24">Installment</TableHead>
              <TableHead className="min-w-36">Amount</TableHead>
              <TableHead className="min-w-32">Method</TableHead>
              <TableHead className="min-w-32">Due Date</TableHead>
              <TableHead className="min-w-36">Status</TableHead>
              <TableHead className="min-w-36">Paid At</TableHead>
              {showUploadAction && <TableHead className="min-w-28">Action</TableHead>}
              <TableHead className="min-w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showUploadAction ? 11 : 10}
                  className="py-10 text-center text-muted-foreground"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4 animate-pulse" /> Loading payments...
                    </span>
                  ) : (
                    'No payment records found.'
                  )}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => (
                <TableRow key={p.id} className="align-middle">
                  <TableCell className="font-mono text-xs">{p.receipt_number}</TableCell>
                  <TableCell className="font-mono text-xs text-amber-700">
                    {p.enrollment_number ?? '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.student_number ?? '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.installment_number} / {p.total_installments}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(p.amount, p.currency)}
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {p.payment_method.replace('_', ' ')}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(p.due_date)}</TableCell>
                  <TableCell>
                    <StatusBadge status={p.payment_status} />
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {paymentStatusLabel(p.payment_status)}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(p.approved_at)}</TableCell>
                  {showUploadAction && (
                    <TableCell>
                      {p.payment_status === 'pending' || p.payment_status === 'rejected' ? (
                        <Link
                          href={`/portal/payments/${p.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Upload Slip
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <button
                      onClick={() => handleView(p)}
                      disabled={loadingId === p.id}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loadingId === p.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Edit2 className="w-3 h-3" />}
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
