import { PageHeader } from '@/components/admin/layout/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Briefcase } from 'lucide-react'

export default function AdminVacanciesPage() {
  return (
    <div>
      <PageHeader
        title="Job Vacancies"
        subtitle="Manage job vacancy listings"
      />
      <EmptyState icon={Briefcase} title="No vacancies yet" description="Job vacancy management will be available once the backend API is connected." />
    </div>
  )
}
