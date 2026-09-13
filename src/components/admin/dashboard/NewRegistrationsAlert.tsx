'use client'

import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  Phone,
} from 'lucide-react'
import { StudentApiResponse } from '@/lib/api/students'
import { formatDate } from '@/lib/utils'

interface NewRegistrationsAlertProps {
  count: number
  students?: StudentApiResponse[]
  onDismiss: () => void
}

export function NewRegistrationsAlert({
  count,
  students = [],
  onDismiss,
}: NewRegistrationsAlertProps) {
  if (count <= 0) return null

  const studentWord = count === 1 ? 'student' : 'students'

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-300/40 bg-linear-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-5 shadow-sm md:p-6 backdrop-blur-md">
      {/* Decorative background glows */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-28 w-28 rounded-full bg-orange-400/15 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Icon + Headline + Subtext */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-900 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>Online Registration</span>
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
              <Clock className="h-3 w-3" /> Just now
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
            🎉 <span className="text-amber-800">new {count} {studentWord} registered</span>
          </h2>
          <p className="max-w-2xl text-xs text-slate-600 md:text-sm">
            Self-registered online applications received via the public portal. Review applicants, course enrollments, and verify documentation.
          </p>

          {/* Quick applicant preview chips if available */}
          {students.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pt-1">
              {students.slice(0, 3).map((student) => (
                <Link
                  key={student.id}
                  href={`/admin/students/${student.id}`}
                  className="group inline-flex items-center gap-2 rounded-xl border border-amber-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs transition hover:border-amber-400 hover:bg-amber-50/80"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700">
                    {student.full_name?.charAt(0) || 'S'}
                  </div>
                  <span className="font-semibold text-slate-900 group-hover:text-amber-900">
                    {student.full_name}
                  </span>
                  <span className="font-mono text-[11px] text-amber-600">
                    {student.student_number}
                  </span>
                  {student.phone_primary && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Phone className="h-2.5 w-2.5" />
                      {student.phone_primary}
                    </span>
                  )}
                </Link>
              ))}
              {students.length > 3 && (
                <span className="inline-flex items-center rounded-xl bg-amber-100/70 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  +{students.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right column: Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 shrink-0">
          <Link
            href="/admin/students?registration_type=self_registered"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-700 hover:shadow-md active:scale-95 md:text-sm"
          >
            <Users className="h-4 w-4" />
            <span>Review {count > 1 ? 'Students' : 'Student'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95 md:text-sm"
            title="Mark these registrations as seen"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Mark as seen</span>
          </button>
        </div>
      </div>
    </section>
  )
}
