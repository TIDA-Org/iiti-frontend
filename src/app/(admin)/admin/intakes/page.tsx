import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Calendar } from 'lucide-react'

export default function AdminIntakesPage() {
  return (
    <div>
      <PageHeader title="Intake Dates" subtitle="Training batch schedule management" />
      <EmptyState icon={Calendar} title="No intakes yet" description="Intake scheduling will be available once the backend API is connected." />
    </div>
  )
}
