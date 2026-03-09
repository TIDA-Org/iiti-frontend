import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { INSTITUTE_INFO } from '@/lib/constants'

export function AccreditationBadges() {
  return (
    <section className="py-8 border-y border-stone-200 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <ScrollReveal delay={0}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs text-center leading-tight px-1">
                ISO<br/>9001
              </div>
              <div>
                <div className="font-semibold text-stone-800 text-sm">ISO 9001:2015 Certified</div>
                <div className="text-stone-500 text-xs">Certificate No. {INSTITUTE_INFO.isoNumber}</div>
              </div>
            </div>
          </ScrollReveal>
          <div className="w-px h-10 bg-stone-300 hidden sm:block" />
          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs text-center leading-tight px-1">
                TVEC<br/>REG
              </div>
              <div>
                <div className="font-semibold text-stone-800 text-sm">TVEC Registered Institute</div>
                <div className="text-stone-500 text-xs">Registration No. {INSTITUTE_INFO.tvecRegNo}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
