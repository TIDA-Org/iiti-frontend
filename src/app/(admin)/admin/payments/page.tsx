import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { CreditCard } from 'lucide-react'

export default function AdminPaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Payment records and revenue tracking"
      />
      <EmptyState icon={CreditCard} title="No payments yet" description="Payment records will appear here when the payments API is connected." />
    </div>
  )
}
