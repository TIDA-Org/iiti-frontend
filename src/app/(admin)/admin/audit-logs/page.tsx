import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Shield } from 'lucide-react'

export default function AdminAuditLogsPage() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="System activity trail (Super Admin only)" />
      <EmptyState icon={Shield} title="No audit logs yet" description="Audit log tracking will be available once the backend API is connected." />
    </div>
  )
}
