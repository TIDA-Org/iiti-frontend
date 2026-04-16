'use client'

import { useApi } from '@/hooks/useApi'
import { apiGetPublicAnnouncements } from '@/lib/api/website'
import { formatDate } from '@/lib/utils'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { DataLoader } from '@/components/shared/DataLoader'

export default function NewsPage() {
  const { data, isLoading, error, refetch } = useApi(() => apiGetPublicAnnouncements(), [])
  const items = data || []

  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Latest Updates</SectionLabel>
          <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>News & Announcements</h1>
        </ScrollReveal>
      </section>
      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
            <div className="space-y-6">
              {items.map((item, i) => (
                <ScrollReveal key={item.id} delay={i * 0.1}>
                  <div className="bg-white rounded-xl border border-stone-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full capitalize">{item.announcement_type}</span>
                      <span className="text-xs text-stone-400">{item.published_at ? formatDate(item.published_at) : formatDate(item.updated_at)}</span>
                    </div>
                    <h3 className="text-lg font-bold text-stone-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.body || 'No announcement body provided.'}</p>
                  </div>
                </ScrollReveal>
              ))}
              {items.length === 0 && <div className="text-center py-10 text-stone-400 text-sm">No announcements published yet.</div>}
            </div>
          </DataLoader>
        </div>
      </section>
    </div>
  )
}
