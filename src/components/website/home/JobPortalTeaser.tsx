import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'

export function JobPortalTeaser() {
  return (
    <section className="grid lg:grid-cols-2 min-h-[400px]">
      {/* Left - dark */}
      <div className="bg-stone-900 flex items-center py-16 px-8 lg:px-16">
        <ScrollReveal direction="left">
          <SectionLabel light>Career Opportunities</SectionLabel>
          <h2
            className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Your Training
            <br />
            <span className="text-orange-400">Opens Doors</span>
          </h2>
          <p className="text-stone-400 text-sm leading-relaxed mb-8 max-w-sm">
            IITI connects graduates with leading employers in construction, logistics, mining,
            and industrial sectors across Sri Lanka and the Middle East.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-white/10"
          >
            Login to View Jobs
          </Link>
        </ScrollReveal>
      </div>

      {/* Right - orange */}
      <div className="bg-orange-500 flex items-center justify-center py-16 px-8">
        <ScrollReveal direction="right">
          <div className="space-y-8 text-center">
            {[
              { value: '50+', label: 'Active Job Listings' },
              { value: '200+', label: 'Partner Employers' },
              { value: 'GCC', label: 'International Placements' },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-5xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{item.value}</div>
                <div className="text-orange-100 text-sm font-medium mt-1">{item.label}</div>
                {i < 2 && <div className="w-12 h-px bg-white/30 mx-auto mt-6" />}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
