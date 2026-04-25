'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useApi } from '@/hooks/useApi'
import { apiGetPublicAnnouncements } from '@/lib/api/website'

export function NewsBanner() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const { data } = useApi(() => apiGetPublicAnnouncements(), [])
  const newsItems = data || []

  useEffect(() => {
    if (!isVisible || newsItems.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [isVisible, newsItems.length])

  const safeIndex = newsItems.length > 0 ? currentIndex % newsItems.length : 0

  if (!isVisible || newsItems.length === 0) return null

  const currentNews = newsItems[safeIndex]

  return (
    <div className="relative bg-linear-to-r from-emerald-400 via-green-400 to-emerald-400 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
        <div className="flex items-center justify-center gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="flex-1 min-w-0 text-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentNews.id}
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

          <button
            onClick={() => setIsVisible(false)}
            className="shrink-0 p-0.5 hover:bg-black/10 rounded-lg transition-colors duration-200"
            aria-label="Close news banner"
          >
            <X className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <div className="flex justify-center gap-1 mt-1">
          {newsItems.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-0.5 rounded-full transition-all duration-300 ${
                i === safeIndex
                  ? 'bg-black w-4'
                  : 'bg-black/40 w-1 hover:bg-black/60'
              }`}
              aria-label={`Go to news ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-emerald-400/30 via-green-400/30 to-emerald-400/30 pointer-events-none" />
    </div>
  )
}
