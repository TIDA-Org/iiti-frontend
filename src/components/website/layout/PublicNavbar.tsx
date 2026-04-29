'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, LayoutDashboard } from 'lucide-react'
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

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-stone-100 px-4 pb-4">
          {NAV_LINKS.map((link) =>
            link.hasDropdown ? (
              <div key="courses-mobile">
                <button
                  onClick={() => setCoursesOpen(!coursesOpen)}
                  className="flex items-center justify-between w-full py-3 text-sm font-medium text-stone-700"
                >
                  {link.label}
                  <ChevronDown className={cn('w-4 h-4 transition-transform', coursesOpen && 'rotate-180')} />
                </button>
                {coursesOpen && (
                  <div className="pl-4 space-y-1">
                    {courseDropdownItems.map((item) => (
                      <Link
                        key={`${item.href}-${item.label}`}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 text-sm text-stone-600 hover:text-orange-500"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium text-stone-700 hover:text-orange-500 border-b border-stone-50"
              >
                {link.label}
              </Link>
            )
          )}
          <div className="flex flex-col gap-2 mt-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === 'student' ? '/portal/dashboard' : '/admin/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-orange-500 border border-orange-500 rounded-md"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full text-center py-2.5 text-sm font-semibold text-orange-500 border border-orange-500 rounded-md">
                  Login
                </Link>
                <Link href="/apply" onClick={() => setMobileOpen(false)} className="w-full text-center py-2.5 text-sm font-semibold bg-orange-500 text-white rounded-md">
                  Apply Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}