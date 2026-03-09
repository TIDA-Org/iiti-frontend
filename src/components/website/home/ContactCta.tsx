import Link from 'next/link'
import { Phone } from 'lucide-react'
import { INSTITUTE_INFO } from '@/lib/constants'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

export function ContactCta() {
  return (
    <section className="py-20 bg-white border-b-4 border-orange-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <h2
            className="text-4xl font-extrabold text-stone-900 mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
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
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-orange-400" /> {INSTITUTE_INFO.telephone}</span>
            <span>|</span>
            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-orange-400" /> {INSTITUTE_INFO.mobile}</span>
            <span>|</span>
            <span>{INSTITUTE_INFO.address}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
