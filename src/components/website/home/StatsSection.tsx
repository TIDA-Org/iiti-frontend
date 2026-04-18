'use client'

import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { apiGetWebsiteStats } from '@/lib/api/website'

const FALLBACK_STATS = [
  { key: 'graduates_trained', value: 0, suffix: '+', label: 'Graduates Trained' },
  { key: 'nvq_programmes', value: 0, suffix: '', label: 'NVQ Level 3 Programmes' },
  { key: 'years_of_excellence', value: 0, suffix: '+', label: 'Years of Excellence' },
  { key: 'tvec_accredited', value: 0, suffix: '%', label: 'TVEC Accredited' },
]

export function StatsSection() {
  const { data } = useApi(() => apiGetWebsiteStats(), [])
  const stats = data && data.length > 0 ? data : FALLBACK_STATS

  return (
    <section className="py-16 bg-white border-t-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="text-center py-4 border-r border-stone-100 last:border-r-0">
                <div
                  className="text-4xl lg:text-5xl font-extrabold text-orange-500 mb-2"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-stone-500 text-sm font-medium">{stat.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
