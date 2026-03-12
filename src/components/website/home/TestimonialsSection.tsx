'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { Card } from '@/components/ui/card'
import { MOCK_TESTIMONIALS } from '@/lib/mock-data/testimonials'

export function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % MOCK_TESTIMONIALS.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const t = MOCK_TESTIMONIALS[current]

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <SectionLabel className="justify-center">Testimonials</SectionLabel>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-4 tracking-tight">
            What Our Graduates Say
          </h2>
          <p className="text-lg text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Hear from industry professionals who have transformed their careers through our specialized training programs
          </p>
        </div>

        <div className="relative">
          {/* Main Testimonial Card */}
          <Card className="overflow-hidden border border-slate-200/50 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="p-6 md:p-8">
              {/* Quote Icon */}
              <div className="flex items-start gap-3 mb-4">
                <Quote className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
              </div>

              {/* Rating */}
              <div className="flex gap-1.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 text-amber-400 fill-amber-400"
                  />
                ))}
                {[...Array(5 - t.rating)].map((_, i) => (
                  <Star
                    key={`empty-${i}`}
                    className="w-4 h-4 text-slate-300"
                  />
                ))}
              </div>

              {/* Quote Text */}
              <blockquote className="text-slate-700 text-base leading-relaxed mb-6">
                {t.quote}
              </blockquote>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-slate-600">{t.role} · {t.location}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.course}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-10">
            {/* Previous Button */}
            <button
              onClick={() => setCurrent((current - 1 + MOCK_TESTIMONIALS.length) % MOCK_TESTIMONIALS.length)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dot Indicators */}
            <div className="flex gap-2">
              {MOCK_TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'bg-slate-400 w-8'
                      : 'bg-slate-300 hover:bg-slate-350'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrent((current + 1) % MOCK_TESTIMONIALS.length)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Testimonial Counter */}
          <div className="text-center mt-6">
            <span className="text-xs text-slate-500 font-medium">
              {current + 1} / {MOCK_TESTIMONIALS.length}
            </span>
          </div>
        </div>

        {/* Additional Testimonial Cards Preview (Optional - shows more testimonials) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-16">
          {MOCK_TESTIMONIALS.slice(0, 3).map((testimonial, idx) => (
            <Card
              key={testimonial.id}
              className="p-6 border border-slate-200/50 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => setCurrent(idx)}
            >
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-white">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-xs text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
