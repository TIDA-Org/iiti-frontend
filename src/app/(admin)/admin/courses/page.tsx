'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { BookOpen, Plus } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

export default function AdminCoursesPage() {
  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage training programmes"
        actions={
          <Link href="/admin/courses/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Course
          </Link>
        }
      />
      <EmptyState icon={BookOpen} title="No courses yet" description="Course management will be available once the backend API is connected. Create your first course to get started." />
    </div>
  )
}
