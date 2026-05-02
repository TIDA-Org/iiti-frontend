'use client'

import Link from 'next/link'
import { Phone } from 'lucide-react'

import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'

export function ContactCta() {
  const { settings } = usePublicSiteSettings()
  const contactItems = [
    { type: 'phone', value: settings.contactPhone },
    { type: 'phone', value: settings.whatsappNumber },
    { type: 'address', value: settings.contactAddress },
  ].filter((item) => Boolean(item.value))

  return (
    <section className="py-20 bg-white border-b-4 border-orange-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2
            className="text-4xl lg:text-5xl font-bold text-stone-900 mb-4 leading-tight tracking-tight"
          >
            Ready to Begin Your Training?
          </h2>
          <p className="text-stone-500 text-lg mb-8">
            Contact us today to learn about the next intake dates, fees, and how to apply.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/apply"
              className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
            >
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border border-stone-300 hover:border-stone-400 text-stone-700 px-8 py-3.5 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
            {contactItems.map((item, index) => (
              <div key={`${item.type}-${item.value}-${index}`} className="contents">
                {index > 0 && <span className="text-stone-300">|</span>}
                {item.type === 'phone' ? (
                  <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-orange-400" /> {item.value}</span>
                ) : (
                  <span>{item.value}</span>
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
