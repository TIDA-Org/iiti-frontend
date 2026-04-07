import { EmptyState } from '@/components/shared/EmptyState'
import { Briefcase } from 'lucide-react'

export default function PortalJobsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Job Board</h1>
        <p className="text-stone-500 text-sm mt-1">Available job positions</p>
      </div>

      <EmptyState icon={Briefcase} title="No jobs available" description="Job listings will appear here once the job board API is connected." />
    </div>
  )
}
