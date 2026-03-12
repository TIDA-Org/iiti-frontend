import Link from 'next/link'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ArrowRight, Briefcase, MapPin, Users } from 'lucide-react'

export function JobPortalTeaser() {
  return (
    <section className="grid lg:grid-cols-2 min-h-[500px]">
      {/* Left - modern dark background */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center py-20 px-8 lg:px-16 relative overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -right-32 -top-32 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <ScrollReveal direction="left" className="relative z-10">
          <SectionLabel light>Career Opportunities</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
            Your Training
            <br />
            <span className="text-orange-500">Opens Doors</span>
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8 max-w-md font-regular">
            IITI connects graduates with leading employers in construction, logistics, mining,
            and industrial sectors across Sri Lanka and the Middle East.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/30"
          >
            Login to View Jobs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </ScrollReveal>
      </div>

      {/* Right - modern orange section with stats */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center py-20 px-8 relative overflow-hidden">
        {/* Decorative gradient blob */}
        <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <ScrollReveal direction="right" className="relative z-10">
          <div className="space-y-10 text-center">
            {[
              { value: '50+', label: 'Active Job Listings', icon: Briefcase },
              { value: '200+', label: 'Partner Employers', icon: Users },
              { value: 'GCC', label: 'International Placements', icon: MapPin },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="group">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-5xl font-bold text-white tracking-tight">{item.value}</div>
                  <div className="text-white/90 text-sm font-medium mt-2">{item.label}</div>
                  {i < 2 && <div className="w-16 h-px bg-white/25 mx-auto mt-8" />}
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
