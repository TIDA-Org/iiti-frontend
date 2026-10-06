'use client'

import React from 'react'
import Link from 'next/link'
import { ClipboardList, ArrowRight, Eye, Sparkles } from 'lucide-react'
import { StudentApiResponse } from '@/lib/api/students'
import { formatDate } from '@/lib/utils'

interface PendingApprovalsWidgetProps {
  students?: StudentApiResponse[]
}

export function PendingApprovalsWidget({ students = [] }: PendingApprovalsWidgetProps) {
  const hasPending = students.length > 0

  return (
    <div className="p-1 sm:p-2">
      {hasPending && (
        <div className="mb-2 flex items-center justify-between px-2 text-xs">
          <span className="font-semibold text-slate-700">
            Online Registrations ({students.length})
          </span>
          <Link
            href="/admin/students?registration_type=self_registered"
            className="font-medium text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {!hasPending ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <ClipboardList className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-400">No pending approvals</p>
          <p className="text-xs text-slate-400/80 mt-1">New online student registrations will appear here</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {students.slice(0, 4).map((student) => (
            <div
              key={student.id}
              className="py-3 px-2 flex items-center justify-between gap-3 first:pt-1 last:pb-1 rounded-xl transition hover:bg-slate-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200/60">
                  {student.full_name?.charAt(0) || 'S'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs md:text-sm font-semibold text-slate-800 truncate">
                      {student.full_name}
                    </p>
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-cyan-50 px-1.5 py-0.2 text-[10px] font-medium text-cyan-700 border border-cyan-200/60">
                      <Sparkles className="h-2.5 w-2.5" />
                      Online
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span className="font-mono text-amber-600 font-medium">{student.student_number}</span>
                    <span>•</span>
                    <span>{formatDate(student.created_at)}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/admin/students/${student.id}`}
                className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Review</span>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
