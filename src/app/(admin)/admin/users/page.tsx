import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Users } from 'lucide-react'

export default function AdminUsersPage() {
  return (
    <div>
      <PageHeader
        title="Staff Users"
        subtitle="Admin and front desk account management"
      />
      <EmptyState icon={Users} title="No staff users yet" description="Staff user management will be available once the backend API is connected." />
    </div>
  )
}
