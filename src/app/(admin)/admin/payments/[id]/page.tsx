'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { PaymentApiResponse } from '@/types/payment'
import { ReceiptApiResponse } from '@/types/receipt'
import { apiGetPayment } from '@/lib/api/payments'
import { apiGetReceiptsByPayment } from '@/lib/api/receipts'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ReceiptsTable } from '@/components/admin/tables/ReceiptsTable'
import { ArrowLeft, CreditCard, Calendar, Hash, Banknote } from 'lucide-react'
import Link from 'next/link'

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

export default function AdminPaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [payment, setPayment] = useState<PaymentApiResponse | null>(null)
  const [receipts, setReceipts] = useState<ReceiptApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([
      apiGetPayment(id),
      apiGetReceiptsByPayment(id),
    ])
      .then(([p, r]) => {
        setPayment(p)
        setReceipts(r.items ?? [])
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [id])

  const handleReceiptUpdated = (updated: ReceiptApiResponse) => {
    setReceipts(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading payment details…
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-slate-500">Payment not found.</p>
        <button onClick={() => router.back()} className="text-sm text-amber-600 hover:underline">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={`Payment — ${payment.receipt_number}`}
        subtitle="Full payment detail and receipt history"
        actions={
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>
        }
      />

      {/* Detail card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">{formatCurrency(payment.amount, payment.currency)}</p>
              <p className="text-xs text-slate-500 capitalize">{payment.payment_method.replace('_', ' ')}</p>
            </div>
          </div>
          <StatusBadge status={payment.payment_status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Hash className="w-3 h-3" /> Installment
            </p>
            <p className="text-slate-700 font-medium">{payment.installment_number} / {payment.total_installments}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Due Date
            </p>
            <p className="text-slate-700">{formatDate(payment.due_date)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Paid At
            </p>
            <p className="text-slate-700">{formatDate(payment.paid_at)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1 mb-1">
              <Banknote className="w-3 h-3" /> Bank Ref #
            </p>
            <p className="text-slate-700 font-mono text-xs">{payment.bank_reference_no ?? '—'}</p>
          </div>
        </div>

        {payment.is_manual && (
          <div className="mt-4 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
            ⚡ This is a manually recorded payment (cash at counter).
          </div>
        )}
      </div>

      {/* Receipts */}
      <h2 className="text-base font-semibold text-slate-700 mb-3">Uploaded Bank Slips</h2>
      <ReceiptsTable
        receipts={receipts}
        isLoading={false}
        onReceiptUpdated={handleReceiptUpdated}
      />
    </div>
  )
}
