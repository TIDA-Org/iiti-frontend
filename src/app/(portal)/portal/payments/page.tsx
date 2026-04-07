import { EmptyState } from '@/components/shared/EmptyState'
import { CreditCard } from 'lucide-react'

export default function PortalPaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800">Payments</h1>
        <p className="text-slate-500 text-xs md:text-sm mt-1">Your payment history and upcoming dues</p>
      </div>

      <EmptyState icon={CreditCard} title="No payment records" description="Payment history will be available once the payments API is connected." />
    </div>
  )
}
