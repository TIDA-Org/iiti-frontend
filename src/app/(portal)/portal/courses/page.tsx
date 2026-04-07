import { EmptyState } from '@/components/shared/EmptyState'
import { BookOpen } from 'lucide-react'

export default function PortalCoursesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>My Courses</h1>
        <p className="text-stone-500 text-sm mt-1">Your enrolled training programmes</p>
      </div>

      <EmptyState icon={BookOpen} title="No courses enrolled" description="Course and enrollment data will be available once the backend API is connected." />
    </div>
  )
}
