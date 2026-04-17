'use client'

import Link from 'next/link'
import {
  Award,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  GraduationCap,
  MapPin,
} from 'lucide-react'

import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'
import { type CourseDetailApiResponse } from '@/lib/api/courses'
import { formatLKR } from '@/lib/utils'

interface CourseApiDetailContentProps {
  course: CourseDetailApiResponse
}

function getDurationSummary(course: CourseDetailApiResponse) {
  const availableDurations = course.duration_options.filter((option) => option.is_available)
  if (availableDurations.length === 0) return 'Contact us for schedule details'

  return availableDurations
    .map((option) => option.label || `${option.duration_value} ${option.duration_unit}`)
    .join(' / ')
}

function getTrainingLocations(course: CourseDetailApiResponse) {
  return course.course_locations.filter((location) => location.is_active)
}

export function CourseApiDetailContent({ course }: CourseApiDetailContentProps) {
  const { settings } = usePublicSiteSettings()
  const locations = getTrainingLocations(course)
  const durationSummary = getDurationSummary(course)

  return (
    <div>
      <section className="bg-linear-to-br from-stone-950 via-stone-900 to-stone-800 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-stone-400">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses" className="hover:text-orange-400">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">{course.name}</span>
          </div>

          <ScrollReveal>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {course.nvq_level && (
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  NVQ Level {course.nvq_level}
                </span>
              )}
              {course.is_nvq_linked && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                  TVEC Registered
                </span>
              )}
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                {course.course_type === 'trial_course' ? 'Trial Route' : 'Full Programme'}
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-extrabold text-white lg:text-5xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {course.name}
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-stone-300">
              {course.description || 'Professional operator training with live schedule, location, and certification details from the institute system.'}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-stone-50 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <ScrollReveal>
              <SectionLabel>Course Overview</SectionLabel>
              <h2 className="mb-5 text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Training Details
              </h2>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                {course.full_details ? (
                  <div
                    className="space-y-4 text-sm leading-7 text-stone-600 [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-stone-900 [&_h4]:mt-5 [&_h4]:text-base [&_h4]:font-semibold [&_h4]:text-stone-800 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3"
                    dangerouslySetInnerHTML={{ __html: course.full_details }}
                  />
                ) : (
                  <p className="text-sm leading-7 text-stone-600">
                    Detailed curriculum information will be published here soon. Contact the institute for the latest intake details and schedule.
                  </p>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="mb-5 text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Available Durations
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {course.duration_options.filter((option) => option.is_available).map((option) => (
                  <div key={option.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center gap-2 text-orange-500">
                      <Clock3 className="h-4 w-4" />
                      <span className="text-sm font-semibold text-stone-800">
                        {option.label || `${option.duration_value} ${option.duration_unit}`}
                      </span>
                    </div>
                    <p className="text-sm text-stone-500">
                      {option.fee_override ? formatLKR(option.fee_override) : formatLKR(course.total_fee)}
                    </p>
                  </div>
                ))}
                {course.duration_options.filter((option) => option.is_available).length === 0 && (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-500">
                    Duration options are being updated. Contact us for the latest intake structure.
                  </div>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className="mb-5 text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Certificates You Receive
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Award, label: 'Institute Certificate', desc: 'Officially issued by IITI' },
                  { icon: CreditCard, label: 'Skill ID Card', desc: 'Identity and training verification support' },
                  { icon: GraduationCap, label: 'NVQ Certification', desc: course.is_nvq_linked ? 'TVEC-linked pathway available' : 'Subject to course pathway' },
                ].map((certificate) => {
                  const Icon = certificate.icon
                  return (
                    <div key={certificate.label} className="rounded-2xl border border-stone-200 bg-white p-5 text-center shadow-sm">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
                        <Icon className="h-5 w-5 text-orange-500" />
                      </div>
                      <h4 className="text-sm font-semibold text-stone-800">{certificate.label}</h4>
                      <p className="mt-1 text-xs text-stone-400">{certificate.desc}</p>
                    </div>
                  )
                })}
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ScrollReveal>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
                <h3 className="mb-5 font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.name}</h3>
                <div className="mb-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-stone-400">Duration</span><span className="text-right font-medium text-stone-700">{durationSummary}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-stone-400">Course Code</span><span className="font-mono text-xs text-stone-500">{course.course_code}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-stone-400">Category</span><span className="text-right font-medium text-stone-700">{course.category?.name || 'Training Programme'}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-stone-400">Installments</span><span className="text-right font-medium text-stone-700">{course.allows_installment ? `Up to ${course.max_installments}` : 'Not available'}</span></div>
                </div>
                <div className="mb-5 rounded-xl bg-orange-50 p-4">
                  <p className="mb-1 text-xs text-stone-400">Course Fee</p>
                  <p className="text-3xl font-extrabold text-orange-600">{formatLKR(course.total_fee)}</p>
                  <p className="mt-1 text-xs text-stone-400">Admission and certificate charges may apply separately.</p>
                </div>
                <div className="space-y-2">
                  <Link href="/apply" className="block w-full rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                    Apply for This Course
                  </Link>
                  <Link href="/contact" className="block w-full rounded-xl border border-stone-200 py-3 text-center text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300">
                    Ask a Question
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.is_nvq_linked && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500">TVEC Reg</span>}
                  {course.nvq_level && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500">NVQ {course.nvq_level}</span>}
                  <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500">Live from API</span>
                </div>
              </div>
            </ScrollReveal>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
              <p className="mb-3 text-xs font-semibold text-orange-700">Training Locations</p>
              <div className="space-y-3 text-sm text-stone-600">
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <div key={location.id} className="flex gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <div>
                        <p className="font-medium text-stone-800">{location.name}</p>
                        {location.address && <p>{location.address}</p>}
                        {location.city && <p className="text-xs text-stone-400">{location.city}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500">Location details are being updated. Contact the office for venue confirmation.</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Need Help?</p>
              <p className="text-sm text-stone-600">Call {settings.contactPhone} or use the contact page for intake dates, payment guidance, and enrollment support.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
