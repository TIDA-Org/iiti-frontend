'use client'

import CountUp from 'react-countup'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedCounterProps {
  end: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2, className }: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {isInView ? (
        <CountUp end={end} duration={duration} separator="," />
      ) : (
        '0'
      )}
      {suffix}
    </span>
  )
}
