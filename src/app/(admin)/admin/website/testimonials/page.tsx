'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import {
  TestimonialApiResponse,
  apiCreateTestimonial,
  apiDeleteTestimonial,
  apiGetAdminTestimonials,
  apiUpdateTestimonial,
} from '@/lib/api/website'
import { formatDate } from '@/lib/utils'

const initialForm = {
  reviewer_name: '',
  reviewer_avatar: '',
  rating: '5',
  review_text: '',
  review_text_si: '',
  google_review_url: '',
  review_date: '',
  source: 'manual',
  display_order: '0',
  is_published: false,
}

export default function AdminWebsiteTestimonialsPage() {
  const { data, isLoading, error, refetch } = useApi(() => apiGetAdminTestimonials(1, 100), [])
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<TestimonialApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) {
      setForm(initialForm)
      return
    }

    setForm({
      reviewer_name: editing.reviewer_name,
      reviewer_avatar: editing.reviewer_avatar || '',
      rating: String(editing.rating),
      review_text: editing.review_text,
      review_text_si: editing.review_text_si || '',
      google_review_url: editing.google_review_url || '',
      review_date: editing.review_date || '',
      source: editing.source,
      display_order: String(editing.display_order),
      is_published: editing.is_published,
    })
  }, [editing])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const payload = {
      reviewer_name: form.reviewer_name,
      reviewer_avatar: form.reviewer_avatar || null,
      rating: Number(form.rating),
      review_text: form.review_text,
      review_text_si: form.review_text_si || null,
      google_review_url: form.google_review_url || null,
      review_date: form.review_date || null,
      source: form.source,
      display_order: Number(form.display_order || 0),
      is_published: form.is_published,
    }

    try {
      if (editing) {
        await apiUpdateTestimonial(editing.id, payload)
        toast.success('Testimonial updated')
      } else {
        await apiCreateTestimonial(payload)
        toast.success('Testimonial created')
      }
      setEditing(null)
      setForm(initialForm)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save testimonial')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteTestimonial(id)
      toast.success('Testimonial deleted')
      if (editing?.id === id) {
        setEditing(null)
        setForm(initialForm)
      }
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete testimonial')
    }
  }

  const items = data?.items || []

  return (
    <div>
      <PageHeader title="Testimonials" subtitle={data ? `${data.total} testimonial records` : 'Loading testimonials...'} />

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">All Testimonials</h3>
          </div>
          <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
            {items.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">No testimonials found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800 truncate">{item.reviewer_name}</h4>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {item.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 capitalize">{item.source.replace('_', ' ')} · {item.rating}/5 · Updated {formatDate(item.updated_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditing(item)} className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DataLoader>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-700">{editing ? 'Edit Testimonial' : 'New Testimonial'}</h3>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-xs text-slate-500 hover:text-slate-700">
                Clear
              </button>
            )}
          </div>

          <input value={form.reviewer_name} onChange={(e) => setForm((prev) => ({ ...prev, reviewer_name: e.target.value }))} placeholder="Reviewer name" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <textarea value={form.review_text} onChange={(e) => setForm((prev) => ({ ...prev, review_text: e.target.value }))} placeholder="Review text" rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <textarea value={form.review_text_si} onChange={(e) => setForm((prev) => ({ ...prev, review_text_si: e.target.value }))} placeholder="Sinhala review text" rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.reviewer_avatar} onChange={(e) => setForm((prev) => ({ ...prev, reviewer_avatar: e.target.value }))} placeholder="Avatar URL" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.google_review_url} onChange={(e) => setForm((prev) => ({ ...prev, google_review_url: e.target.value }))} placeholder="Google review URL" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.source} onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="manual">Manual</option>
              <option value="google_review">Google Review</option>
            </select>
            <input type="number" min="1" max="5" value={form.rating} onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))} placeholder="Rating" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.review_date} onChange={(e) => setForm((prev) => ({ ...prev, review_date: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="number" min="0" value={form.display_order} onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))} placeholder="Display order" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
            Publish immediately
          </label>

          <button type="submit" disabled={saving} className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5">
            {saving ? 'Saving...' : editing ? 'Update Testimonial' : 'Create Testimonial'}
          </button>
        </form>
      </div>
    </div>
  )
}
