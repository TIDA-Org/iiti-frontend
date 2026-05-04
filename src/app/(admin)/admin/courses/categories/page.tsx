'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  apiCreateCourseCategory,
  apiGetCourseCategories,
  apiUpdateCourseCategory,
  CourseCategoryApiResponse,
} from '@/lib/api/courses'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { usePermissionAccess } from '@/hooks/usePermissionAccess'
import { DataLoader } from '@/components/shared/DataLoader'
import { SearchInput } from '@/components/shared/SearchInput'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { FolderTree, Pencil, Plus, X, Check } from 'lucide-react'
import { toast } from 'sonner'

const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export default function AdminCourseCategoriesPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<CourseCategoryApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  const [editName, setEditName] = useState('')
  const [editNameSi, setEditNameSi] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDescriptionSi, setEditDescriptionSi] = useState('')
  const [editIconUrl, setEditIconUrl] = useState('')
  const [editDisplayOrder, setEditDisplayOrder] = useState(0)
  const [editActive, setEditActive] = useState(true)
  const { hasPermission } = usePermissionAccess()

  const canCreateCategory = hasPermission('courses.create')
  const canEditCategory = hasPermission('courses.edit')

  useEffect(() => {
    if (!canEditCategory && editing) {
      setEditing(null)
    }
  }, [canEditCategory, editing])

  const { data, isLoading, error, refetch } = useApi<CourseCategoryApiResponse[]>(
    () => apiGetCourseCategories(),
    [],
  )

  const categories = useMemo(() => {
    let list = data || []
    if (search.trim()) {
      const lowerSearch = search.toLowerCase()
      list = list.filter((cat) =>
        cat.name.toLowerCase().includes(lowerSearch) ||
        cat.name_si?.toLowerCase().includes(lowerSearch) ||
        cat.description?.toLowerCase().includes(lowerSearch)
      )
    }
    return [...list].sort((a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name))
  }, [data, search])

  const startEdit = (row: CourseCategoryApiResponse) => {
    setEditing(row)
    setShowCreate(false)
    setEditName(row.name)
    setEditNameSi(row.name_si || '')
    setEditSlug(row.slug)
    setEditDescription(row.description || '')
    setEditDescriptionSi(row.description_si || '')
    setEditIconUrl(row.icon_url || '')
    setEditDisplayOrder(row.display_order)
    setEditActive(row.is_active)
  }

  const resetEdit = () => {
    setEditing(null)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const fd = new FormData(e.currentTarget)

    const name = (fd.get('name') as string).trim()
    const slugInput = ((fd.get('slug') as string) || '').trim()
    const slug = slugInput || toSlug(name)

    try {
      await apiCreateCourseCategory({
        name,
        name_si: ((fd.get('name_si') as string) || '').trim() || null,
        slug,
        description: ((fd.get('description') as string) || '').trim() || null,
        description_si: ((fd.get('description_si') as string) || '').trim() || null,
        icon_url: ((fd.get('icon_url') as string) || '').trim() || null,
        display_order: Number(fd.get('display_order') || 0),
        is_active: true,
      })
      toast.success('Category created')
      setShowCreate(false)
      e.currentTarget.reset()
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await apiUpdateCourseCategory(editing.id, {
        name: editName.trim(),
        name_si: editNameSi.trim() || null,
        slug: editSlug.trim() || toSlug(editName),
        description: editDescription.trim() || null,
        description_si: editDescriptionSi.trim() || null,
        icon_url: editIconUrl.trim() || null,
        display_order: editDisplayOrder,
        is_active: editActive,
      })
      toast.success('Category updated')
      setEditing(null)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Course Categories"
        subtitle={data ? `${categories.length} categories` : 'Loading...'}
        actions={
          canCreateCategory ? (
            <button
              onClick={() => {
                setShowCreate((v) => !v)
                if (!showCreate) setEditing(null)
              }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showCreate ? 'Cancel' : 'Add Category'}
            </button>
          ) : null
        }
      />

      {canEditCategory && editing && (
        <div className="bg-white rounded-xl border-2 border-amber-300 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700">
              Edit Category <span className="text-amber-600">{editing.name}</span>
            </h3>
            <button onClick={resetEdit} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
              <input
                value={editName}
                onChange={(e) => {
                  const value = e.target.value
                  setEditName(value)
                  if (!editSlug.trim() || editSlug === toSlug(editName)) {
                    setEditSlug(toSlug(value))
                  }
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input value={editNameSi} onChange={(e) => setEditNameSi(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
              <input value={editSlug} onChange={(e) => setEditSlug(toSlug(e.target.value))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Display Order</label>
              <input type="number" value={editDisplayOrder} onChange={(e) => setEditDisplayOrder(Number(e.target.value) || 0)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description (Sinhala)</label>
              <textarea value={editDescriptionSi} onChange={(e) => setEditDescriptionSi(e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Icon URL</label>
              <input value={editIconUrl} onChange={(e) => setEditIconUrl(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-xs font-medium text-slate-500">Active</label>
              <button
                type="button"
                onClick={() => setEditActive(!editActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editActive ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${editActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <button onClick={resetEdit} className="px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={saving || !editName.trim() || !editSlug.trim()}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {canCreateCategory && showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">New Category</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
              <input
                name="name"
                required
                onChange={(e) => {
                  const form = e.currentTarget.form
                  if (!form) return
                  const slugEl = form.elements.namedItem('slug') as HTMLInputElement | null
                  if (slugEl && !slugEl.value) slugEl.value = toSlug(e.target.value)
                }}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Name (Sinhala)</label>
              <input name="name_si" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
              <input name="slug" required className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Display Order</label>
              <input name="display_order" type="number" defaultValue={0} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <textarea name="description" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description (Sinhala)</label>
              <textarea name="description_si" rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Icon URL</label>
              <input name="icon_url" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={creating} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
              {creating ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by category name or description..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{categories.length} results</span>
        </div>
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          {categories.length === 0 ? (
            <EmptyState icon={FolderTree} title="No categories yet" description={search ? "No categories match your search." : "Create your first course category."} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Slug</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Order</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Created</th>
                    {canEditCategory && <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {categories.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40">
                      <td className="px-5 py-3 text-sm text-slate-700">
                        <div className="font-medium">{row.name}</div>
                        {row.name_si && <div className="text-xs text-slate-400">{row.name_si}</div>}
                      </td>
                      <td className="px-5 py-3 text-sm text-slate-500">{row.slug}</td>
                      <td className="px-5 py-3 text-sm text-slate-500">{row.display_order}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={row.is_active ? 'active' : 'inactive'} />
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">{formatDate(row.created_at)}</td>
                      {canEditCategory && (
                        <td className="px-5 py-3">
                          <button onClick={() => startEdit(row)} className="text-slate-500 hover:text-slate-700" title="Edit category">
                            <Pencil className="w-4 h-4" />
                          </button>
                        </td>
                      )}
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
