import { Award, Book, type LucideIcon, Package2, TimerReset, Zap } from 'lucide-react'

import { type CourseApiResponse } from '@/lib/api/courses'

const FEATURED_COURSE_CODES = ['FORK-OP', 'EXCV-OP', 'BCHL-OP'] as const
const FEATURED_COURSE_CODE_SET = new Set<string>(FEATURED_COURSE_CODES)

export function getFeaturedCourses(courses: CourseApiResponse[]) {
  const order = new Map<string, number>(FEATURED_COURSE_CODES.map((code, index) => [code, index]))

  return courses
    .filter((course) => FEATURED_COURSE_CODE_SET.has(course.course_code))
    .sort((left, right) => (order.get(left.course_code) ?? 99) - (order.get(right.course_code) ?? 99))
}

export function getCourseIcon(course: CourseApiResponse): LucideIcon {
  const value = `${course.course_code} ${course.short_name || ''} ${course.name}`.toLowerCase()

  if (value.includes('fork')) return Zap
  if (value.includes('excavator')) return Award
  if (value.includes('package')) return Package2
  if (value.includes('one-day') || value.includes('one day') || value.includes('trial')) return TimerReset
  return Book
}

export function getCourseDuration(course: CourseApiResponse) {
  const available = course.duration_options.filter((option) => option.is_available)
  if (available.length === 0) return 'Contact for duration'

  const primary = available[0]
  if (primary.label) return primary.label

  const unit = primary.duration_unit.endsWith('s') ? primary.duration_unit : `${primary.duration_unit}s`
  return `${primary.duration_value} ${unit}`
}

export function getCourseCardImage(course: CourseApiResponse): string {
  const code = course.course_code.toUpperCase()
  if (code === 'FORK-OP') return '/images/course_cards/forklift.jpg'
  if (code === 'EXCV-OP') return '/images/course_cards/crawler_excavator.jpg'
  if (code === 'BCHL-OP') return '/images/course_cards/backhoe_loader.jpg'
  if (code === 'PACK-40D') return '/images/course_cards/heavy_equipment.jpg'
  if (code === 'PKG-ALL') return '/images/course_cards/boom_tractor.jpg'
  return '/images/course_cards/heavy_equipment.jpg'
}

export function getCourseThemeColor(course: CourseApiResponse): string {
  const code = course.course_code.toUpperCase()
  if (code === 'FORK-OP') return '24 95% 40%'           // orange
  if (code === 'EXCV-OP') return '38 90% 38%'           // amber
  if (code === 'BCHL-OP') return '15 85% 38%'           // red-orange
  if (code === 'PACK-40D') return '220 60% 35%'         // steel blue
  if (code === 'PKG-ALL') return '270 50% 35%'          // deep purple
  return '24 95% 40%'
}

export function getCourseAccent(course: CourseApiResponse) {
  const value = `${course.course_code} ${course.short_name || ''} ${course.name}`.toLowerCase()

  if (value.includes('excavator')) return 'from-amber-500 to-orange-600'
  if (value.includes('backhoe') || value.includes('jcb')) return 'from-orange-500 to-red-500'
  if (value.includes('package')) return 'from-slate-700 to-slate-900'
  if (value.includes('one-day') || value.includes('one day') || value.includes('trial')) return 'from-emerald-500 to-teal-600'
  return 'from-orange-500 to-orange-600'
}