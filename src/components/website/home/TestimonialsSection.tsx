'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { MOCK_TESTIMONIALS } from '@/lib/mock-data/testimonials'

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % MOCK_TESTIMONIALS.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const t = MOCK_TESTIMONIALS[current]

  return (
    <section className="py-24 bg-gradient-to-br from-orange-500 to-orange-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <SectionLabel light className="justify-center">Testimonials</SectionLabel>
        <h2
          className="text-4xl font-extrabold text-white mb-12"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          What Our Graduates Say
        </h2>

        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12">
            <div className="flex justify-center mb-4">
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <blockquote className="text-stone-700 text-lg leading-relaxed mb-6 italic">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <div>
              <div className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.name}</div>
              <div className="text-stone-500 text-sm">{t.role}, {t.location}</div>
              <div className="text-orange-500 text-xs mt-1">{t.course}</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setCurrent((current - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {MOCK_TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
              />
            ))}
            <button
              onClick={() => setCurrent((current + 1) % MOCK_TESTIMONIALS.length)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
