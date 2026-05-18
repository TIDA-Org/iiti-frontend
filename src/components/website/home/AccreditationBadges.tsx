'use client'

import { ScrollReveal } from '@/components/shared/ScrollReveal'

import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'

export function AccreditationBadges() {
  const { settings } = usePublicSiteSettings()

  return (
    <section className="py-16 border-y border-stone-200 bg-gradient-to-r from-stone-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-16">
          <ScrollReveal delay={0}>
            <div className="flex flex-col sm:flex-row items-center gap-6 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm text-center leading-tight px-2 shadow-lg shrink-0">
                ISO<br/>9001
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-stone-900 text-base">ISO 9001:2015 Certified</div>
                <div className="text-stone-600 text-sm mt-1">Certificate No. {settings.isoCertification}</div>
              </div>
            </div>
          </ScrollReveal>
          <div className="w-px h-16 bg-gradient-to-b from-stone-300 via-stone-400 to-stone-300 hidden sm:block" />
          <ScrollReveal delay={0.1}>
            <div className="flex flex-col sm:flex-row items-center gap-6 group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white font-bold text-sm text-center leading-tight px-2 shadow-lg shrink-0">
                TVEC<br/>REG
              </div>
              <div className="text-center sm:text-left">
                <div className="font-bold text-stone-900 text-base">TVEC Registered Institute</div>
                <div className="text-stone-600 text-sm mt-1">Registration No. {settings.tvecAccreditation}</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
