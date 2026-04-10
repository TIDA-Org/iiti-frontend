'use client'

import { useState } from 'react'
import { apiGetCourses, apiGetCourseCategories, apiCreateCourse, apiUpdateCourse, CourseApiResponse, CourseCategoryApiResponse } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataLoader } from '@/components/shared/DataLoader'
import { EmptyState } from '@/components/shared/EmptyState'
import { formatDate } from '@/lib/utils'
import { BookOpen, Plus, X, Pencil, Check } from 'lucide-react'
import { toast } from 'sonner'

const courseTypeLabel: Record<string, string> = {
  nvq_course: 'NVQ Course',
  trial_course: 'Trial Course',
}

export default function AdminCoursesPage() {
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [editCategoryId, setEditCategoryId] = useState<number>(0)
  const [editCourseCode, setEditCourseCode] = useState('')
  const [editCourseType, setEditCourseType] = useState('nvq_course')
  const [editName, setEditName] = useState('')
  const [editNameSi, setEditNameSi] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editTotalFee, setEditTotalFee] = useState<number>(0)
  const [editNvqLevel, setEditNvqLevel] = useState('')
  const [editActive, setEditActive] = useState(true)

  const { data: courses, isLoading, error, refetch } = useApi<CourseApiResponse[]>(
    () => apiGetCourses(),
    [],
  )

  const { data: categories } = useApi<CourseCategoryApiResponse[]>(
    () => apiGetCourseCategories(),
    [],
  )

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)
    try {
      await apiCreateCourse({
        category_id: Number(fd.get('category_id')),
        course_code: fd.get('course_code') as string,
        course_type: fd.get('course_type') as string,
        name: fd.get('name') as string,
        name_si: (fd.get('name_si') as string) || null,
        description: (fd.get('description') as string) || null,
        total_fee: Number(fd.get('total_fee')) || 0,
        nvq_level: (fd.get('nvq_level') as string) || null,
        is_active: true,
      })
      toast.success('Course created')
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (course: CourseApiResponse) => {
    setEditingCourse(course)
    setShowForm(false)
    setEditCategoryId(course.category_id)
    setEditCourseCode(course.course_code)
    setEditCourseType(course.course_type)
    setEditName(course.name)
    setEditNameSi(course.name_si || '')
    setEditDescription(course.description || '')
    setEditTotalFee(course.total_fee)
    setEditNvqLevel(course.nvq_level || '')
    setEditActive(course.is_active)
  }

  const cancelEdit = () => {
    setEditingCourse(null)
  }

  const handleUpdate = async () => {
    if (!editingCourse) return
    setSaving(true)
    try {
      await apiUpdateCourse(editingCourse.id, {
        category_id: editCategoryId,
        course_code: editCourseCode,
        course_type: editCourseType,
        name: editName,
        name_si: editNameSi || null,
        description: editDescription || null,
        total_fee: editTotalFee,
        nvq_level: editNvqLevel || null,
        is_active: editActive,
      })
      toast.success('Course updated')
      setEditingCourse(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update course')
    } finally {
      setSaving(false)
    }
  }

  const list = courses || []

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={courses ? `${list.length} training programmes` : 'Loading...'}
        actions={
          <button
            onClick={() => {
              setShowForm(!showForm)
              if (!showForm) setEditingCourse(null)
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Course'}
          </button>
        }
      />

      {editingCourse && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">Edit Course — <span className="text-amber-600">{editingCourse.name}</span></h3>
            <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Name *</label>
              <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input value={editNameSi} onChange={e => setEditNameSi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Code *</label>
              <input value={editCourseCode} onChange={e => setEditCourseCode(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category *</label>
              <select value={String(editCategoryId)} onChange={e => setEditCategoryId(Number(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                {(categories || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Type *</label>
              <select value={editCourseType} onChange={e => setEditCourseType(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="nvq_course">NVQ Course</option>
                <option value="trial_course">Trial Course</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total Fee (LKR) *</label>
              <input type="number" min={0} step="0.01" value={editTotalFee} onChange={e => setEditTotalFee(Number(e.target.value) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">NVQ Level</label>
              <input value={editNvqLevel} onChange={e => setEditNvqLevel(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-xs font-medium text-slate-500">Course Active</label>
              <button
                type="button"
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-xs font-medium ${editActive ? 'text-green-600' : 'text-slate-400'}`}>{editActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={cancelEdit} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || !editName.trim() || !editCourseCode.trim() || !editCategoryId}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">New Course</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Name *</label>
              <input name="name" required minLength={1} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input name="name_si" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Code *</label>
              <input name="course_code" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. FL-01" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category *</label>
              <select name="category_id" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="">Select category...</option>
                {(categories || []).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course Type *</label>
              <select name="course_type" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none">
                <option value="nvq_course">NVQ Course</option>
                <option value="trial_course">Trial Course</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Total Fee (LKR) *</label>
              <input name="total_fee" type="number" min={0} step="0.01" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">NVQ Level</label>
              <input name="nvq_level" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" placeholder="e.g. Level 3" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea name="description" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {list.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" description="Add your first training programme using the button above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Code</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Fee (LKR)</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">NVQ</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Created</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {list.map((course: CourseApiResponse) => (
                    <tr key={course.id} className={`hover:bg-slate-50 ${editingCourse?.id === course.id ? 'bg-amber-50' : ''}`}>
                      <td className="px-5 py-3 font-mono text-xs text-amber-600 font-medium">{course.course_code}</td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{course.name}</p>
                        {course.name_si && <p className="text-xs text-slate-400">{course.name_si}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          {courseTypeLabel[course.course_type] || course.course_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-700 font-mono">{course.total_fee.toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{course.nvq_level || '-'}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={course.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(course.created_at)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => startEdit(course)}
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                          title="Edit course"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
