'use client'

import { Star, ExternalLink, ThumbsUp, Users } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const GOOGLE_REVIEW_URL =
  'https://search.google.com/local/writereview?placeid=ChIJ3ew4zUtR4joRVx3iLocv6kY'

const HIGHLIGHTS = [
  { icon: ThumbsUp, label: 'Trusted by graduates' },
  { icon: Star, label: 'Recognised quality training' },
  { icon: Users, label: 'Growing IITI community' },
]

export function GoogleReviewSection() {
  return (
    <section className="py-20 bg-white border-t border-stone-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          {/* Label */}
          <SectionLabel className="justify-center">Student Feedback</SectionLabel>

          {/* Heading */}
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight tracking-tight">
            Enjoyed Your Training at{' '}
            <span className="text-orange-500">IITI?</span>
          </h2>

          {/* Sub-heading */}
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Your Google review helps future students make an informed choice and motivates
            our team to keep raising the bar. It takes less than a minute!
          </p>

          {/* Highlight pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-stone-50 text-slate-700 text-sm font-medium"
              >
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-orange-500" />
                </div>
                {label}
              </div>
            ))}
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1.5 mb-8">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-7 h-7 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {/* CTA Button */}
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            {/* Authentic Google "G" SVG */}
            <svg className="w-5 h-5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Write a Google Review
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>

        </ScrollReveal>
      </div>
    </section>
  )
}
