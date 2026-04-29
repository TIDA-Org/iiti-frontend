import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'

interface CourseImageCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  title: string
  description: string
  duration: string
  code: string
  href: string
  /** HSL value string, e.g. "24 95% 45%" */
  themeColor: string
  learnMoreLabel?: string
}

const CourseImageCard = React.forwardRef<HTMLDivElement, CourseImageCardProps>(
  (
    {
      className,
      imageUrl,
      title,
      description,
      duration,
      code,
      href,
      themeColor,
      learnMoreLabel = 'Learn More',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        style={{ '--theme-color': themeColor } as React.CSSProperties}
        className={cn('group h-full w-full', className)}
        {...props}
      >
        <Link
          href={href}
          className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl shadow-lg transition-all duration-500 ease-in-out group-hover:scale-[1.02] group-hover:shadow-[0_0_60px_-15px_hsl(var(--theme-color)/0.55)]"
          aria-label={`Learn more about ${title}`}
        >
          {/* Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to top, hsl(var(--theme-color) / 0.92), hsl(var(--theme-color) / 0.55) 40%, transparent 70%)`,
            }}
          />

          {/* Code badge top-right */}
          <div className="relative z-10 flex justify-end p-4">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {code}
            </span>
          </div>

          {/* Content at bottom */}
          <div className="relative z-10 mt-auto p-6 text-white">
            <h3 className="mb-1 text-xl font-bold leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {title}
            </h3>
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/80">{description}</p>

            <div className="flex items-center gap-1.5 mb-4 text-white/70 text-xs font-medium">
              <Clock className="h-3.5 w-3.5" />
              {duration}
            </div>

            {/* CTA bar */}
            <div
              className="flex items-center justify-between rounded-xl border border-white/20 bg-white/15 px-4 py-3 backdrop-blur-md transition-all duration-300 group-hover:bg-white/25 group-hover:border-white/35"
            >
              <span className="text-sm font-semibold tracking-wide">{learnMoreLabel}</span>
              <ArrowRight className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </Link>
      </div>
    )
  },
)
CourseImageCard.displayName = 'CourseImageCard'

export { CourseImageCard }
