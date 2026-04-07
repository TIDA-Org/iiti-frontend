import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Tag } from 'lucide-react'

export default function AdminOffersPage() {
  return (
    <div>
      <PageHeader
        title="Offers & Discounts"
        subtitle="Manage promotional offers"
      />
      <EmptyState icon={Tag} title="No offers yet" description="Promotional offer management will be available once the backend API is connected." />
    </div>
  )
}
