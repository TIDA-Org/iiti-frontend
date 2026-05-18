'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronDown, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

const HERO_IMAGES = [
  '/images/hero/DSC07563.jpg',
  '/images/hero/DSC07577.jpg',
  '/images/hero/DSC07657.jpg',
  '/images/hero/DSC07664.jpg',
  '/images/hero/DSC07644.jpg',
]

interface WhyChooseUsItem {
  key: string
  label: string
  label_si?: string
}

interface WhyChooseUsData {
  title: string
  title_si?: string
  items: WhyChooseUsItem[]
}

const DEFAULT_WHY_CHOOSE_US_DATA: WhyChooseUsData = {
  title: 'Why Choose Us',
  items: [
    { key: 'programmes_available', label: '3 Programmes Available' },
    { key: 'nvq_certified', label: 'NVQ Level 3 Certified' },
    { key: 'placement_assistance', label: '100% Placement Assistance' },
    { key: 'accredited', label: 'TVEC & ISO Accredited' },
  ],
}

export function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [whyChooseUsData, setWhyChooseUsData] = useState<WhyChooseUsData>(DEFAULT_WHY_CHOOSE_US_DATA)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 5000) // Change image every 5 seconds
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchWhyChooseUsData = async () => {
      try {
        const response = await fetch('/api/backend/website/why-choose-us', { cache: 'no-store' })
        if (response.ok) {
          const data = (await response.json()) as Partial<WhyChooseUsData>
          if (data && Array.isArray(data.items) && data.items.length > 0) {
            setWhyChooseUsData({
              title: data.title || DEFAULT_WHY_CHOOSE_US_DATA.title,
              title_si: data.title_si,
              items: data.items,
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch Why Choose Us data:', error)
      }
    }

    fetchWhyChooseUsData()
  }, [])
  return (
    <section
      className="relative flex min-h-[calc(100svh-7rem)] items-center overflow-hidden lg:min-h-[calc(100svh-6.75rem)]"
    >
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((image, index) => (
          <motion.img
            key={image}
            src={image}
            alt={`Heavy vehicle ${index + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
            transition={{ duration: 1 }}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-10" />
        {/* Orange gradient overlay */}
        <div
          className="absolute inset-0 opacity-20 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(249,115,22,0.3) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Original gradient background as fallback */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1C1917 50%, #0A0A0A 100%)',
          zIndex: -1,
        }}
      />

      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-18 lg:px-8 lg:py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="flex items-center gap-2 mb-4 -mt-12"
            >
              <div className="w-8 h-0.5 bg-orange-400" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">
                Sri Lanka&apos;s Premier Heavy Vehicle Training Institute
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              className="text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 tracking-tight"
            >
              Train Today.
              <br />
              <span className="text-orange-500">Operate</span>
              <br />
              Tomorrow.
            </motion.h1>

            {/* Body */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.25 }}
              className="text-white/80 text-base lg:text-lg leading-relaxed max-w-xl mb-6 font-regular"
            >
              Imasha International Training Institute offers TVEC-accredited NVQ Level 3 training
              for Forklift, Excavator, and Backhoe Loader operations — recognized locally and internationally.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30"
              >
                Apply Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 border border-white/30 hover:border-white/60 text-white px-7 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 hover:bg-white/10"
              >
                Explore Courses
              </Link>
            </motion.div>
          </div>

          {/* Right — floating card */}
          <motion.div
            initial={{ opacity: 0, x: 40, y: 40 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
            className="hidden lg:flex justify-center -mt-12"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full"
              style={{ transform: 'rotate(-2deg)' }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {whyChooseUsData.title}
                </h3>
                <div className="w-12 h-1 bg-orange-500 rounded-full" />
              </div>
              <ul className="space-y-4">
                {whyChooseUsData.items.map((item) => (
                  <li key={item.key} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image indicators/dots */}
      <div className="absolute bottom-18 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-20 lg:bottom-16">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-orange-500 w-8'
                : 'bg-white/40 w-2 hover:bg-white/60'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 sm:bottom-6"
      >
        <ChevronDown className="w-6 h-6 text-white/40" />
      </motion.div>
    </section>
  )
}
