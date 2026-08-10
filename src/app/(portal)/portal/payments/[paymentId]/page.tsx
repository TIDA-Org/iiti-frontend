'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ReceiptUploadForm } from '@/components/shared/ReceiptUploadForm'
import { apiGetPayment } from '@/lib/api/payments'
import { PaymentApiResponse } from '@/types/payment'
import { ReceiptApiResponse } from '@/types/receipt'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { ArrowLeft, CreditCard } from 'lucide-react'

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default function PortalUploadReceiptPage() {
  const { paymentId } = useParams<{ paymentId: string }>()
  const router = useRouter()

  const [payment, setPayment] = useState<PaymentApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!paymentId) return
    apiGetPayment(paymentId)
      .then(setPayment)
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [paymentId])

  const handleUploadSuccess = (_receipt: ReceiptApiResponse) => {
    // Auto-redirect after a short delay to let the success state show
    setTimeout(() => router.push('/portal/payments'), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
        Loading payment…
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      {/* Back navigation */}
      <button
        onClick={() => router.push('/portal/payments')}
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </button>

      {/* Payment summary */}
      {payment && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{formatCurrency(payment.amount, payment.currency)}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Installment {payment.installment_number} / {payment.total_installments} · Due {formatDate(payment.due_date)}
                </p>
              </div>
            </div>
            <StatusBadge status={payment.payment_status} />
          </div>
          <p className="text-xs text-slate-400 mt-3 font-mono">Receipt #: {payment.receipt_number}</p>
        </div>
      )}

      {/* Upload form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h1 className="text-lg font-bold text-slate-800 mb-1">Upload Bank Deposit Slip</h1>
        <p className="text-sm text-slate-500 mb-5">
          Upload your bank deposit receipt so our staff can verify your payment.
        </p>

        {payment && (
          <ReceiptUploadForm
            paymentId={payment.id}
            onSuccess={handleUploadSuccess}
          />
        )}
      </div>
    </div>
  )
}
