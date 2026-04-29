'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import {
  Award,
  BookOpenText,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  GraduationCap,
  MapPin,
  Network,
  Route,
  Sparkles,
} from 'lucide-react'

import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { CourseLanguageSwitch, useCourseLanguage } from '@/components/website/courses/CourseLanguageProvider'
import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'
import { type CourseDetailApiResponse } from '@/lib/api/courses'
import {
  getCourseLanguageHref,
  getCourseTextClass,
  getLocalizedCategoryName,
  getLocalizedCourseDescription,
  getLocalizedCourseDetails,
  getLocalizedCourseName,
  getLocalizedCourseTypeLabel,
  getLocalizedDurationLabel,
  getLocalizedDurationSummary,
  getLocalizedLocationName,
} from '@/lib/public-course-language'
import { cn, formatLKR } from '@/lib/utils'

interface CourseApiDetailContentProps {
  course: CourseDetailApiResponse
}

function getTrainingLocations(course: CourseDetailApiResponse) {
  return course.course_locations.filter((location) => location.is_active)
}

function getCurriculumTopics(html: string) {
  const matches = Array.from(html.matchAll(/<h[34][^>]*>(.*?)<\/h[34]>/gi))

  return matches
    .map((match) => match[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim())
    .filter(Boolean)
    .filter((topic, index, list) => list.indexOf(topic) === index)
    .slice(0, 8)
}

export function CourseApiDetailContent({ course }: CourseApiDetailContentProps) {
  const { settings } = usePublicSiteSettings()
  const { lang, copy } = useCourseLanguage()
  const locations = getTrainingLocations(course)
  const durationSummary = getLocalizedDurationSummary(course, lang, copy.contactForSchedule)
  const localizedName = getLocalizedCourseName(course, lang)
  const localizedDescription = getLocalizedCourseDescription(
    course,
    lang,
    'Professional operator training with live schedule, location, and certification details from the institute system.',
  )
  const localizedDetails = getLocalizedCourseDetails(course, lang)
  const curriculumTopics = useMemo(() => getCurriculumTopics(localizedDetails), [localizedDetails])
  const availableDurations = course.duration_options.filter((option) => option.is_available)
  const titleStyle = lang === 'en' ? { fontFamily: 'Outfit, sans-serif' } : undefined

  return (
    <div>
      <section className="bg-linear-to-br from-stone-950 via-stone-900 to-stone-800 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-stone-400">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={getCourseLanguageHref('/courses', lang)} className={cn('hover:text-orange-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.courses}</Link>
            <ChevronRight className="h-4 w-4" />
            <span className={cn('text-white', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{localizedName}</span>
          </div>

          <ScrollReveal>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {course.nvq_level && (
                <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                  NVQ Level {course.nvq_level}
                </span>
              )}
              {course.is_nvq_linked && (
                <span className={cn('rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                  {copy.tvecRegistered}
                </span>
              )}
              <span className={cn('rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                {getLocalizedCourseTypeLabel(course, lang)}
              </span>
            </div>

            <h1 className={cn('mb-4 text-4xl font-extrabold text-white lg:text-5xl', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>
              {localizedName}
            </h1>
            <p className={cn('max-w-3xl text-lg leading-relaxed text-stone-300', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
              {localizedDescription}
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Language Selector - Mobile Friendly Top Position */}
      <section className="border-b border-stone-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-6xl flex justify-end">
          <CourseLanguageSwitch />
        </div>
      </section>

      <section className="bg-stone-50 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <ScrollReveal>
              <SectionLabel className={cn(getCourseTextClass(lang))}>{copy.courseOverview}</SectionLabel>
              <h2 className={cn('mb-5 text-2xl font-bold text-stone-800', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>
                {copy.trainingDetails}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <Clock3 className="h-5 w-5" />
                  </div>
                  <p className={cn('text-xs font-semibold uppercase tracking-[0.18em] text-stone-400', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} lang={lang === 'si' ? 'si' : undefined}>{copy.duration}</p>
                  <p className={cn('mt-2 text-base font-semibold leading-7 text-stone-900', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{durationSummary}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <Route className="h-5 w-5" />
                  </div>
                  <p className={cn('text-xs font-semibold uppercase tracking-[0.18em] text-stone-400', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} lang={lang === 'si' ? 'si' : undefined}>{copy.studyOptions}</p>
                  <p className="mt-2 text-3xl font-bold text-stone-900">{availableDurations.length}</p>
                  <p className={cn('mt-1 text-sm text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.availableDurations}</p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <Network className="h-5 w-5" />
                  </div>
                  <p className={cn('text-xs font-semibold uppercase tracking-[0.18em] text-stone-400', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} lang={lang === 'si' ? 'si' : undefined}>{copy.activeLocations}</p>
                  <p className="mt-2 text-3xl font-bold text-stone-900">{locations.length}</p>
                  <p className={cn('mt-1 text-sm text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.trainingLocations}</p>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
                <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-900 text-white shadow-sm">
                      <BookOpenText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={cn('text-xl font-bold text-stone-900', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>{copy.programmeBrief}</h3>
                      <p className={cn('text-sm text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.practicalFocus}</p>
                    </div>
                  </div>

                  <p className={cn('text-sm leading-7 text-stone-600', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                    {localizedDescription}
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      course.is_nvq_linked ? copy.tvecRegistered : getLocalizedCourseTypeLabel(course, lang),
                      `${copy.courseCode}: ${course.course_code}`,
                      `${copy.category}: ${getLocalizedCategoryName(course.category, lang, copy.trainingProgramme)}`,
                      course.allows_installment ? (lang === 'si' ? `${course.max_installments} දක්වා වාරික` : `Up to ${course.max_installments} installments`) : copy.notAvailable,
                    ].map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-2xl bg-stone-50 px-3 py-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                        <span className={cn('text-sm text-stone-700', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-orange-200 bg-linear-to-br from-orange-50 via-white to-amber-50 p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className={cn('text-xl font-bold text-stone-900', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>{copy.certificationOutcomes}</h3>
                      <p className={cn('text-sm text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.certificatesYouReceive}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Award, label: copy.instituteCertificate, desc: copy.instituteCertificateDesc },
                      { icon: CreditCard, label: copy.skillIdCard, desc: copy.skillIdCardDesc },
                      { icon: GraduationCap, label: copy.nvqCertification, desc: course.is_nvq_linked ? copy.nvqPathwayAvailable : copy.subjectToPathway },
                    ].map((certificate) => {
                      const Icon = certificate.icon
                      return (
                        <div key={certificate.label} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_25px_-18px_rgba(15,23,42,0.45)]">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={cn('text-sm font-semibold text-stone-800', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{certificate.label}</p>
                            <p className={cn('mt-1 text-xs leading-6 text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{certificate.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-200 bg-linear-to-r from-stone-50 via-white to-stone-50 px-6 py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <SectionLabel className={cn('mb-2', getCourseTextClass(lang))}>{copy.courseRoadmap}</SectionLabel>
                      <h3 className={cn('text-2xl font-bold text-stone-900', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>{copy.keyTopics}</h3>
                      <p className={cn('mt-2 max-w-2xl text-sm leading-6 text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.keyTopicsDescription}</p>
                    </div>

                    {curriculumTopics.length > 0 && (
                      <div className="flex max-w-2xl flex-wrap gap-2 lg:justify-end">
                        {curriculumTopics.map((topic) => (
                          <span key={topic} className={cn('rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-6 py-6">
                  {localizedDetails ? (
                    <div
                      className={cn(
                        'prose max-w-none text-stone-600 prose-headings:text-stone-900 prose-p:text-stone-600 prose-strong:text-stone-800 prose-li:text-stone-600 [&_h3]:rounded-2xl [&_h3]:bg-stone-50 [&_h3]:px-4 [&_h3]:py-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:shadow-[inset_0_0_0_1px_rgba(231,229,228,0.8)] [&_h4]:mt-8 [&_h4]:text-base [&_h4]:font-semibold [&_li]:marker:text-orange-500',
                        lang === 'si' && 'font-sinhala tracking-normal',
                      )}
                      lang={lang === 'si' ? 'si' : undefined}
                      dangerouslySetInnerHTML={{ __html: localizedDetails }}
                    />
                  ) : (
                    <p className={cn('text-sm leading-7 text-stone-600', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                      {copy.detailsFallback}
                    </p>
                  )}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <h2 className={cn('mb-5 text-2xl font-bold text-stone-800', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>
                {copy.availableDurations}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {availableDurations.map((option) => (
                  <div key={option.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-linear-to-r from-orange-500 to-amber-500" />
                    <div className="p-5">
                      <div className="mb-3 flex items-center gap-2 text-orange-500">
                      <Clock3 className="h-4 w-4" />
                      <span className={cn('text-sm font-semibold text-stone-800', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                        {getLocalizedDurationLabel(option, lang)}
                      </span>
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className={cn('text-xs uppercase tracking-[0.18em] text-stone-400', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} lang={lang === 'si' ? 'si' : undefined}>{copy.courseFee}</p>
                          <p className="mt-1 text-xl font-bold text-stone-900">{option.fee_override ? formatLKR(option.fee_override) : formatLKR(course.total_fee)}</p>
                        </div>
                        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">{course.course_code}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {availableDurations.length === 0 && (
                  <div className={cn('rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>
                    {copy.durationFallback}
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <ScrollReveal>
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-md">
                <h3 className={cn('mb-5 font-bold text-stone-800', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} style={titleStyle} lang={lang === 'si' ? 'si' : undefined}>{localizedName}</h3>
                <div className="mb-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><span className={cn('text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.duration}</span><span className={cn('text-right font-medium text-stone-700', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{durationSummary}</span></div>
                  <div className="flex justify-between gap-4"><span className={cn('text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.courseCode}</span><span className="font-mono text-xs text-stone-500">{course.course_code}</span></div>
                  <div className="flex justify-between gap-4"><span className={cn('text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.category}</span><span className={cn('text-right font-medium text-stone-700', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{getLocalizedCategoryName(course.category, lang, copy.trainingProgramme)}</span></div>
                  <div className="flex justify-between gap-4"><span className={cn('text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.installments}</span><span className={cn('text-right font-medium text-stone-700', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{course.allows_installment ? (lang === 'si' ? `${course.max_installments} දක්වා වාරික` : `Up to ${course.max_installments}`) : copy.notAvailable}</span></div>
                </div>
                <div className="mb-5 rounded-xl bg-orange-50 p-4">
                  <p className={cn('mb-1 text-xs text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.courseFee}</p>
                  <p className="text-3xl font-extrabold text-orange-600">{formatLKR(course.total_fee)}</p>
                  <p className={cn('mt-1 text-xs text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.admissionNote}</p>
                </div>
                <div className="space-y-2">
                  <Link href="/apply" className="block w-full rounded-xl bg-orange-500 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-orange-600">
                    <span className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.applyForCourse}</span>
                  </Link>
                  <Link href="/contact" className="block w-full rounded-xl border border-stone-200 py-3 text-center text-sm font-semibold text-stone-600 transition-colors hover:border-stone-300">
                    <span className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.askQuestion}</span>
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {course.is_nvq_linked && <span className={cn('rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>TVEC Reg</span>}
                  {course.nvq_level && <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500">NVQ {course.nvq_level}</span>}
                  <span className={cn('rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.liveFromApi}</span>
                </div>
              </div>
            </ScrollReveal>

            <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
              <p className={cn('mb-3 text-xs font-semibold text-orange-700', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.trainingLocations}</p>
              <div className="space-y-3 text-sm text-stone-600">
                {locations.length > 0 ? (
                  locations.map((location) => (
                    <div key={location.id} className="flex gap-2.5">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                      <div>
                        <p className={cn('font-medium text-stone-800', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{getLocalizedLocationName(location, lang)}</p>
                        {location.address && <p className={cn(getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{location.address}</p>}
                        {location.city && <p className={cn('text-xs text-stone-400', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{location.city}</p>}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={cn('text-xs text-stone-500', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.locationFallback}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <p className={cn('mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500', getCourseTextClass(lang), lang === 'si' && 'tracking-normal')} lang={lang === 'si' ? 'si' : undefined}>{copy.needHelp}</p>
              <p className={cn('text-sm text-stone-600', getCourseTextClass(lang))} lang={lang === 'si' ? 'si' : undefined}>{copy.helpCopy.replace('{phone}', settings.contactPhone)}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
