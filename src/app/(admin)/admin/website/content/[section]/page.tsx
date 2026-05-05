'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import { apiGetContentSection, apiUpdateContentSection } from '@/lib/api/website'

interface Props { params: { section: string } }

export default function AdminWebsiteContentSectionPage({ params }: Props) {
  const { section } = params
  const { data, isLoading, error, refetch } = useApi(() => apiGetContentSection(section), [section])
  const [form, setForm] = useState({ title: '', title_si: '', content: '', content_si: '', meta_description: '', is_published: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!data) return
    setForm({
      title: data.title || '',
      title_si: data.title_si || '',
      content: data.content || '',
      content_si: data.content_si || '',
      meta_description: data.meta_description || '',
      is_published: data.is_published,
    })
  }, [data])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    try {
      await apiUpdateContentSection(section, {
        title: form.title || null,
        title_si: form.title_si || null,
        content: form.content || null,
        content_si: form.content_si || null,
        meta_description: form.meta_description || null,
        is_published: form.is_published,
      })
      toast.success('Content section updated')
      refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update content section')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title={`Website Content: ${section}`} subtitle="Manage bilingual CMS content for this section" />
      <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="English title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.title_si} onChange={(e) => setForm((prev) => ({ ...prev, title_si: e.target.value }))} placeholder="Sinhala title" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <textarea value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="English content" rows={10} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.content_si} onChange={(e) => setForm((prev) => ({ ...prev, content_si: e.target.value }))} placeholder="Sinhala content" rows={10} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <textarea value={form.meta_description} onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))} placeholder="Meta description" rows={3} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))} />
            Publish this section
          </label>
          <button type="submit" disabled={saving} className="rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5">
            {saving ? 'Saving...' : 'Save Section'}
          </button>
        </form>
      </DataLoader>
    </div>
  )
}
