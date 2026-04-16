'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import {
  AnnouncementApiResponse,
  apiCreateAnnouncement,
  apiDeleteAnnouncement,
  apiGetAdminAnnouncements,
  apiUpdateAnnouncement,
} from '@/lib/api/website'
import { formatDate } from '@/lib/utils'

const initialForm = {
  title: '',
  title_si: '',
  body: '',
  body_si: '',
  announcement_type: 'news',
  image_url: '',
  link_url: '',
  display_order: '0',
  is_published: false,
  expires_at: '',
}

export default function AdminWebsiteAnnouncementsPage() {
  const { data, isLoading, error, refetch } = useApi(() => apiGetAdminAnnouncements(1, 100), [])
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<AnnouncementApiResponse | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!editing) {
      setForm(initialForm)
      return
    }

    setForm({
      title: editing.title,
      title_si: editing.title_si || '',
      body: editing.body || '',
      body_si: editing.body_si || '',
      announcement_type: editing.announcement_type,
      image_url: editing.image_url || '',
      link_url: editing.link_url || '',
      display_order: String(editing.display_order),
      is_published: editing.is_published,
      expires_at: editing.expires_at ? editing.expires_at.slice(0, 16) : '',
    })
  }, [editing])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    const payload = {
      title: form.title,
      title_si: form.title_si || null,
      body: form.body || null,
      body_si: form.body_si || null,
      announcement_type: form.announcement_type,
      image_url: form.image_url || null,
      link_url: form.link_url || null,
      display_order: Number(form.display_order || 0),
      is_published: form.is_published,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    }

    try {
      if (editing) {
        await apiUpdateAnnouncement(editing.id, payload)
        toast.success('Announcement updated')
      } else {
        await apiCreateAnnouncement(payload)
        toast.success('Announcement created')
      }
      setEditing(null)
      setForm(initialForm)
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save announcement')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteAnnouncement(id)
      toast.success('Announcement deleted')
      if (editing?.id === id) {
        setEditing(null)
        setForm(initialForm)
      }
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete announcement')
    }
  }

  const items = data?.items || []

  return (
    <div>
      <PageHeader title="Announcements" subtitle={data ? `${data.total} announcement records` : 'Loading announcements...'} />

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-700">All Announcements</h3>
          </div>
          <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
            {items.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-400">No announcements found.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-800 truncate">{item.title}</h4>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {item.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 capitalize">{item.announcement_type} · Updated {formatDate(item.updated_at)}</p>
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
            <h3 className="font-semibold text-slate-700">{editing ? 'Edit Announcement' : 'New Announcement'}</h3>
            {editing && (
              <button type="button" onClick={() => setEditing(null)} className="text-xs text-slate-500 hover:text-slate-700">
                Clear
              </button>
            )}
          </div>

          <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" required />
          <input value={form.title_si} onChange={(e) => setForm((prev) => ({ ...prev, title_si: e.target.value }))} placeholder="Sinhala title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.body} onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))} placeholder="Body" rows={5} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.body_si} onChange={(e) => setForm((prev) => ({ ...prev, body_si: e.target.value }))} placeholder="Sinhala body" rows={4} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />

          <div className="grid grid-cols-2 gap-3">
            <select value={form.announcement_type} onChange={(e) => setForm((prev) => ({ ...prev, announcement_type: e.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="news">News</option>
              <option value="banner">Banner</option>
              <option value="alert">Alert</option>
            </select>
            <input type="number" min="0" value={form.display_order} onChange={(e) => setForm((prev) => ({ ...prev, display_order: e.target.value }))} placeholder="Display order" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>

          <input value={form.image_url} onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="Image URL" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input value={form.link_url} onChange={(e) => setForm((prev) => ({ ...prev, link_url: e.target.value }))} placeholder="Link URL" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm((prev) => ({ ...prev, expires_at: e.target.value }))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
            Publish immediately
          </label>

          <button type="submit" disabled={saving} className="w-full rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5">
            {saving ? 'Saving...' : editing ? 'Update Announcement' : 'Create Announcement'}
          </button>
        </form>
      </div>
    </div>
  )
}
