'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ChevronDown, LayoutDashboard, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { getPublicCourseHref } from '@/lib/public-course-routes'
import { useAuthStore } from '@/store/authStore'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { label: 'Courses', hasDropdown: true },
  { href: '/jobs', label: 'Jobs' },
  { href: '/contact', label: 'Contact' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [coursesOpen, setCoursesOpen] = useState(false)
  const pathname = usePathname()
  const { isAuthenticated, user } = useAuthStore()
  const { data: coursesData } = useApi(() => apiGetCourses(), [])

  const courseDropdownItems = useMemo(() => {
    const activeCourses = (coursesData || []).filter((course) => course.is_active)

    if (activeCourses.length === 0) {
      return [{ href: '/courses', label: 'All Programmes' }]
    }

    return activeCourses
      .sort((left, right) => left.display_order - right.display_order)
      .map((course) => ({
        href: getPublicCourseHref(course),
        label: course.name,
      }))
  }, [coursesData])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setCoursesOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white transition-shadow duration-300',
        scrolled ? 'shadow-md' : 'shadow-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/assets/logo.JPG"
              alt="IITI Logo"
              width={160}
              height={60}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.hasDropdown ? (
                <div key="courses" className="relative group">
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname.startsWith('/courses')
                        ? 'text-orange-500 font-semibold'
                        : 'text-stone-700 hover:text-orange-500'
                    )}
                  >
                    {link.label}
                    <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" />
                  </button>
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {courseDropdownItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        className="block px-4 py-3 text-sm text-stone-700 hover:text-orange-500 hover:bg-orange-50 first:rounded-t-xl last:rounded-b-xl transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    pathname === link.href
                      ? 'text-orange-500 font-semibold'
                      : 'text-stone-700 hover:text-orange-500'
                  )}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === 'student' ? '/portal/dashboard' : '/admin/dashboard'}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/apply"
                  className="px-5 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-all duration-200 hover:scale-105"
                >
                  Apply Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-stone-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — full-screen slide-in from right */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0, 0.08, 1] }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-white shadow-2xl lg:hidden"
            >
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
                <Image src="/assets/logo.JPG" alt="IITI" width={100} height={38} className="object-contain" />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
                  className="space-y-1"
                >
                  {NAV_LINKS.map((link) =>
                    link.hasDropdown ? (
                      <motion.li
                        key="courses-mobile"
                        variants={{ hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } } }}
                      >
                        <button
                          onClick={() => setCoursesOpen(!coursesOpen)}
                          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 hover:bg-orange-50 hover:text-orange-500 transition-colors"
                        >
                          {link.label}
                          <ChevronDown className={cn('h-4 w-4 text-stone-400 transition-transform duration-200', coursesOpen && 'rotate-180 text-orange-500')} />
                        </button>
                        <AnimatePresence>
                          {coursesOpen && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden pl-4"
                            >
                              {courseDropdownItems.map((item, idx) => (
                                <motion.li
                                  key={`${item.href}-${item.label}`}
                                  initial={{ opacity: 0, x: 12 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.04, duration: 0.2 }}
                                >
                                  <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-stone-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                  >
                                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-orange-400" />
                                    {item.label}
                                  </Link>
                                </motion.li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    ) : (
                      <motion.li
                        key={link.href}
                        variants={{ hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.28, ease: 'easeOut' } } }}
                      >
                        <Link
                          href={link.href!}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors',
                            pathname === link.href
                              ? 'bg-orange-50 text-orange-500'
                              : 'text-stone-800 hover:bg-stone-50 hover:text-orange-500',
                          )}
                        >
                          {link.label}
                        </Link>
                      </motion.li>
                    )
                  )}
                </motion.ul>
              </nav>

              {/* CTA buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.28, ease: 'easeOut' }}
                className="border-t border-stone-100 px-4 py-5 space-y-2"
              >
                {isAuthenticated ? (
                  <Link
                    href={user?.role === 'student' ? '/portal/dashboard' : '/admin/dashboard'}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full rounded-xl border border-orange-500 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Profile
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full rounded-xl border border-orange-500 py-3 text-sm font-semibold text-orange-500 hover:bg-orange-50 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      href="/apply"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                    >
                      Apply Now
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}