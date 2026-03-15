'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'

const NEWS_ITEMS = [
  {
    id: 1,
    title: 'New Batch Starting April 2025 - Limited Seats Available',
    description: 'Enroll now for our Forklift, Excavator, and Backhoe Loader training programs',
  },
  {
    id: 2,
    title: 'Recent Graduate Placement - 98% Success Rate This Quarter',
    description: 'Our graduates are securing positions within 2-3 weeks of certification',
  },
  {
    id: 3,
    title: 'International Opportunities - GCC Placements Open',
    description: 'Join our successful graduates working across Middle East employers',
  },
  {
    id: 4,
    title: 'Early Bird Discount - Register Before March 31st',
    description: 'Get 15% off on all training programs with early registration',
  },
]

export function NewsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (!isVisible) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isVisible])

  const currentNews = NEWS_ITEMS[currentIndex]

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center justify-center gap-2">
          {/* Icon and content */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* <div className="flex-shrink-0 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-black animate-bounce" />
            </div> */}
            
            <div className="flex-1 min-w-0 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="min-w-0"
                >
                  <div className="text-xs md:text-sm font-bold text-black truncate">
                    {currentNews.title}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-0.5 hover:bg-black/10 rounded-lg transition-colors duration-200"
            aria-label="Close news banner"
          >
            <X className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        {/* Progress dots - centered */}
        <div className="flex justify-center gap-1 mt-1">
          {NEWS_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'bg-black w-4'
                  : 'bg-black/40 w-1 hover:bg-black/60'
              }`}
              aria-label={`Go to news ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/30 via-green-400/30 to-emerald-400/30 pointer-events-none" />
    </div>
  )
}
