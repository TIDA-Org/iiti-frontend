import { MOCK_NEWS } from '@/lib/mock-data/news'
import { formatDate } from '@/lib/utils'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

export default function NewsPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Latest Updates</SectionLabel>
          <h1 className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>News & Announcements</h1>
        </ScrollReveal>
      </section>
      <section className="py-20 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {MOCK_NEWS.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 0.1}>
              <div className="bg-white rounded-xl border border-stone-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full capitalize">{item.category}</span>
                  <span className="text-xs text-stone-400">{formatDate(item.publishedAt)}</span>
                </div>
                <h3 className="text-lg font-bold text-stone-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.summary}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </div>
  )
}
