'use client'

import { SectionLabel } from '@/components/shared/SectionLabel'
import TestimonialsEditorial, {
  type EditorialTestimonialItem,
} from '@/components/ui/editorial-testimonial'
import { useApi } from '@/hooks/useApi'
import { apiGetPublicTestimonials } from '@/lib/api/website'

function buildMetaLabel(source: string, reviewDate: string | null) {
  const parts = [source.replace(/_/g, ' ')]

  if (reviewDate) {
    parts.push(reviewDate)
  }

  return parts.map((part) =>
    part
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  ).join(' / ')
}

export function TestimonialsSection() {
  const { data } = useApi(() => apiGetPublicTestimonials(), [])
  const testimonials = data || []

  if (testimonials.length === 0) {
    return null
  }

  const items: EditorialTestimonialItem[] = testimonials.map((testimonial) => ({
    id: testimonial.id,
    quote: testimonial.review_text,
    author: testimonial.reviewer_name,
    role: `${testimonial.rating}/5 Rating`,
    company: buildMetaLabel(testimonial.source, testimonial.review_date),
    image: testimonial.reviewer_avatar,
    href: testimonial.google_review_url,
  }))

  return (
    <section className="bg-linear-to-b from-white via-stone-50 to-white py-14 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-5 lg:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <SectionLabel className="justify-center">Testimonials</SectionLabel>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            What Our Graduates Say
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Real feedback from professionals who trained with us and took that experience back into the field.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white/70 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.28)] backdrop-blur-sm">
          <TestimonialsEditorial items={items} />
        </div>
      </div>
    </section>
  )
}
