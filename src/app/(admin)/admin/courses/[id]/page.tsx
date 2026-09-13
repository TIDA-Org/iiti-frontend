'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiGetCourse, CourseDetailApiResponse } from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { FileText, ArrowLeft } from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params?.id as string

  const { data: course, isLoading, error, refetch } = useApi<CourseDetailApiResponse>(
    () => apiGetCourse(courseId),
    [courseId]
  )

  return (
    <div>
      <div className="mb-6 mb-4">
        <button 
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-amber-600 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
        {course && (
          <>
            <PageHeader
              title={course.name}
              subtitle={course.course_code}
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              
              <Link href={`/admin/courses/${course.id}/certificate-templates`} className="block group">
                <div className="bg-white rounded-xl border border-slate-200 p-6 h-full hover:border-amber-500 hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-lg mb-1 group-hover:text-amber-600 transition-colors">Certificate Templates</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Manage the competency text printed on the backside of certificates for this course. 
                        {course.is_trial && " Includes specific templates for trial sub-courses (Forklift, Excavator, Backhoe)."}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Space for future sections like Batches, Enrollments, Materials */}
              
            </div>
          </>
        )}
      </DataLoader>
    </div>
  )
}
