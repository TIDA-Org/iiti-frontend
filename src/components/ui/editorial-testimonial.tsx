'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn, getInitials } from '@/lib/utils'

export interface EditorialTestimonialItem {
  id: string | number
  quote: string
  author: string
  role?: string | null
  company?: string | null
  image?: string | null
  href?: string | null
}

interface TestimonialsEditorialProps {
  items?: EditorialTestimonialItem[]
  className?: string
}

const STOCK_TESTIMONIALS: EditorialTestimonialItem[] = [
  {
    id: 1,
    quote: 'The attention to detail and creative vision transformed our brand identity completely.',
    author: 'Sarah Chen',
    role: 'Creative Director',
    company: 'Studio Forma',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    quote: 'Working with them felt like a true creative partnership from day one.',
    author: 'Marcus Webb',
    role: 'Head of Design',
    company: 'Minimal Co',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    quote: 'They understand that great design is invisible yet unforgettable.',
    author: 'Elena Voss',
    role: 'Art Director',
    company: 'Pixel & Co',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=900&q=80',
  },
]

function TestimonialAvatar({
  author,
  image,
}: {
  author: string
  image?: string | null
}) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = Boolean(image) && !imageFailed

  return (
    <div className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-foreground/10 transition-all duration-300 group-hover:ring-foreground/30 sm:h-11 sm:w-11">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image || ''}
          alt={author}
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-400 to-slate-600 text-xs font-semibold text-white sm:text-sm">
          {getInitials(author)}
        </div>
      )}
    </div>
  )
}

export default function TestimonialsEditorial({
  items,
  className,
}: TestimonialsEditorialProps) {
  const testimonials = items && items.length > 0 ? items : STOCK_TESTIMONIALS
  const [active, setActive] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutIds = useRef<number[]>([])

  useEffect(() => {
    return () => {
      timeoutIds.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
      timeoutIds.current = []
    }
  }, [])

  const safeActive = testimonials.length > 0 ? active % testimonials.length : 0

  const queueTimeout = (callback: () => void, delayMs: number) => {
    const timeoutId = window.setTimeout(callback, delayMs)
    timeoutIds.current.push(timeoutId)
  }

  const handleChange = (index: number) => {
    if (index === safeActive || isTransitioning || testimonials.length === 0) {
      return
    }

    setIsTransitioning(true)
    queueTimeout(() => {
      setActive(index)
      queueTimeout(() => setIsTransitioning(false), 50)
    }, 300)
  }

  const handlePrev = () => {
    const newIndex = safeActive === 0 ? testimonials.length - 1 : safeActive - 1
    handleChange(newIndex)
  }

  const handleNext = () => {
    const newIndex = safeActive === testimonials.length - 1 ? 0 : safeActive + 1
    handleChange(newIndex)
  }

  const current = testimonials[safeActive]

  if (!current) {
    return null
  }

  return (
    <div className={cn('mx-auto w-full max-w-2xl px-3 py-7 sm:px-4 sm:py-8 lg:px-5 lg:py-10', className)}>
      <div className="flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-start lg:gap-6">
        <span
          className="select-none text-[42px] leading-none text-foreground/10 transition-all duration-500 sm:text-[56px] lg:text-[72px]"
          style={{ fontFeatureSettings: '"tnum"' }}
        >
          {String(safeActive + 1).padStart(2, '0')}
        </span>

        <div className="flex-1 pt-0 lg:pt-3">
          <blockquote
            className={cn(
              'text-base font-light leading-relaxed tracking-tight text-foreground transition-all duration-300 sm:text-lg md:text-xl',
              isTransitioning ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100',
            )}
          >
            {current.quote}
          </blockquote>

          <div
            className={cn(
              'group mt-7 cursor-default transition-all duration-300 delay-100 sm:mt-8',
              isTransitioning ? 'opacity-0' : 'opacity-100',
            )}
          >
            <div className="flex items-center gap-3">
              <TestimonialAvatar author={current.author} image={current.image} />
              <div>
                <p className="text-xs font-medium text-foreground sm:text-sm">{current.author}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {current.role || 'Graduate'}
                  {(current.company || current.href) ? (
                    <>
                      <span className="mx-2 text-foreground/20">/</span>
                      {current.href ? (
                        <a
                          href={current.href}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-300 group-hover:text-foreground"
                        >
                          {current.company || 'View review'}
                        </a>
                      ) : (
                        <span className="transition-colors duration-300 group-hover:text-foreground">
                          {current.company}
                        </span>
                      )}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => handleChange(index)}
                className="group relative py-2.5"
                aria-label={`Show testimonial ${index + 1}`}
              >
                <span
                  className={cn(
                    'block h-px transition-all duration-500 ease-out',
                    index === safeActive
                      ? 'w-7 bg-foreground sm:w-8'
                      : 'w-4 bg-foreground/20 group-hover:w-6 group-hover:bg-foreground/40',
                  )}
                />
              </button>
            ))}
          </div>
          <span className="text-[11px] uppercase tracking-widest text-muted-foreground sm:text-xs">
            {String(safeActive + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrev}
            className="rounded-full p-1 text-foreground/40 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground sm:p-1.5"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
          <button
            onClick={handleNext}
            className="rounded-full p-1 text-foreground/40 transition-all duration-300 hover:bg-foreground/5 hover:text-foreground sm:p-1.5"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}