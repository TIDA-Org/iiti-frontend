'use client'

import { useEffect, useMemo, useState } from 'react'
import { Briefcase } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import {
  JobVacancyApiResponse,
  apiCloseVacancy,
  apiCreateVacancy,
  apiGetAdminVacancies,
  apiPublishVacancy,
  apiUpdateVacancy,
} from '@/lib/api/jobs'
import { formatDate } from '@/lib/utils'

const initialForm = {
  title: '',
  title_si: '',
  company_name: '',
  description: '',
  description_si: '',
  location: '',
  salary_range: '',
  application_deadline: '',
  is_published: false,
  required_course_ids: [] as string[],
}

const vacancyStatusStyles: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-red-100 text-red-700',
}

export default function AdminVacanciesPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const vacanciesApi = useApi(() => apiGetAdminVacancies(1, 100, statusFilter), [statusFilter])
  const coursesApi = useApi(() => apiGetCourses(), [])
  const [editing, setEditing] = useState<JobVacancyApiResponse | null>(null)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const courses = coursesApi.data || []
  const vacancies = vacanciesApi.data?.items || []
  const subtitle = vacanciesApi.data ? `${vacanciesApi.data.total} vacancy records` : 'Loading vacancies...'

  useEffect(() => {
    if (!editing) {
      setForm(initialForm)
      return
    }

    setForm({
      title: editing.title,
      title_si: editing.title_si || '',
      company_name: editing.company_name,
      description: editing.description,
      description_si: editing.description_si || '',
      location: editing.location || '',
      salary_range: editing.salary_range || '',
      application_deadline: editing.application_deadline || '',
      is_published: editing.is_published,
      required_course_ids: editing.required_course_ids || [],
    })
  }, [editing])

  const selectedCourseSet = useMemo(() => new Set(form.required_course_ids), [form.required_course_ids])

  function toggleCourse(courseId: string) {
    setForm((prev) => ({
      ...prev,
      required_course_ids: prev.required_course_ids.includes(courseId)
        ? prev.required_course_ids.filter((id) => id !== courseId)
        : [...prev.required_course_ids, courseId],
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      title_si: form.title_si || null,
      company_name: form.company_name,
      description: form.description,
      description_si: form.description_si || null,
      location: form.location || null,
      salary_range: form.salary_range || null,
      application_deadline: form.application_deadline || null,
      required_course_ids: form.required_course_ids.length > 0 ? form.required_course_ids : null,
      is_published: form.is_published,
    }

    try {
      if (editing) {
        await apiUpdateVacancy(editing.id, payload)
        toast.success('Vacancy updated')
      } else {
        await apiCreateVacancy(payload)
        toast.success('Vacancy created')
      }

      setEditing(null)
      setForm(initialForm)
      await vacanciesApi.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save vacancy')
    } finally {
      setSaving(false)
    }
  }

  async function handlePublish(id: string) {
    try {
      await apiPublishVacancy(id)
      toast.success('Vacancy published')
      await vacanciesApi.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish vacancy')
    }
  }

  async function handleClose(id: string) {
    try {
      await apiCloseVacancy(id)
      toast.success('Vacancy closed')
      if (editing?.id === id) {
        setEditing(null)
        setForm(initialForm)
      }
      await vacanciesApi.refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to close vacancy')
    }
  }

  return (
    <div>
      <PageHeader
        title="Job Vacancies"
        subtitle={subtitle}
        actions={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="font-semibold text-slate-700">All Vacancies</h3>
          </div>

          <DataLoader isLoading={vacanciesApi.isLoading} error={vacanciesApi.error} onRetry={vacanciesApi.refetch}>
            {vacancies.length === 0 ? (
              <EmptyState icon={Briefcase} title="No vacancies found" description="Create a vacancy to publish new job opportunities for students." className="py-12" />
            ) : (
              <div className="divide-y divide-slate-100">
                {vacancies.map((vacancy) => (
                  <div key={vacancy.id} className="px-5 py-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h4 className="truncate font-medium text-slate-800">{vacancy.title}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${vacancyStatusStyles[vacancy.vacancy_status] || 'bg-slate-100 text-slate-600'}`}>
                            {vacancy.vacancy_status}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${vacancy.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                            {vacancy.is_published ? 'Published' : 'Hidden'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-orange-600">{vacancy.company_name}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {vacancy.location || 'Location not specified'}
                          {vacancy.application_deadline ? ` · Deadline ${formatDate(vacancy.application_deadline)}` : ''}
                          {` · ${vacancy.application_count} applications`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setEditing(vacancy)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-orange-300 hover:text-orange-600">
                          Edit
                        </button>
                        {vacancy.vacancy_status !== 'active' && (
                          <button onClick={() => handlePublish(vacancy.id)} className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50">
                            Publish
                          </button>
                        )}
                        {vacancy.vacancy_status !== 'closed' && (
                          <button onClick={() => handleClose(vacancy.id)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataLoader>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">{editing ? 'Edit Vacancy' : 'New Vacancy'}</h3>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-xs text-slate-500 hover:text-slate-700">
                Clear
              </button>
            )}
          </div>

          <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Job title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input value={form.title_si} onChange={(event) => setForm((prev) => ({ ...prev, title_si: event.target.value }))} placeholder="Sinhala title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.company_name} onChange={(event) => setForm((prev) => ({ ...prev, company_name: event.target.value }))} placeholder="Company name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />

          <div className="grid grid-cols-2 gap-3">
            <input value={form.location} onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))} placeholder="Location" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.salary_range} onChange={(event) => setForm((prev) => ({ ...prev, salary_range: event.target.value }))} placeholder="Salary range" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <input type="date" value={form.application_deadline} onChange={(event) => setForm((prev) => ({ ...prev, application_deadline: event.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Job description" rows={6} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <textarea value={form.description_si} onChange={(event) => setForm((prev) => ({ ...prev, description_si: event.target.value }))} placeholder="Sinhala description" rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />

          <div className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 text-sm font-medium text-slate-700">Required Courses</div>
            <DataLoader isLoading={coursesApi.isLoading} error={coursesApi.error} onRetry={coursesApi.refetch}>
              <div className="max-h-48 space-y-2 overflow-auto pr-1">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" checked={selectedCourseSet.has(course.id)} onChange={() => toggleCourse(course.id)} />
                    <span>{course.name}</span>
                  </label>
                ))}
              </div>
            </DataLoader>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm((prev) => ({ ...prev, is_published: event.target.checked }))} />
            Publish immediately
          </label>

          <button type="submit" disabled={saving} className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60">
            {saving ? 'Saving...' : editing ? 'Update Vacancy' : 'Create Vacancy'}
          </button>
        </form>
      </div>
    </div>
  )
}
