'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatLKR } from '@/lib/utils'
import { BookOpen, Plus, Eye, Clock } from 'lucide-react'

export default function AdminCoursesPage() {
  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle="Manage training programmes"
        actions={
          <Link href="/admin/courses/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus className="w-4 h-4" /> Add Course
          </Link>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        {MOCK_COURSES.map(course => (
          <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <StatusBadge status={course.isActive ? 'active' : 'inactive'} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{course.name}</h3>
              <p className="text-xs text-slate-400 mb-3 font-mono">{course.code}</p>
              <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{course.duration}</div>
                <div className="font-semibold text-slate-700">{formatLKR(course.fee)}</div>
              </div>
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">NVQ L{course.nvqLevel}</span>
                {course.tvecRegistered && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">TVEC</span>}
              </div>
              <Link href={`/admin/courses/${course.id}`} className="flex items-center justify-center gap-1.5 w-full border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 py-2 rounded-lg text-xs font-semibold transition-colors">
                <Eye className="w-3.5 h-3.5" /> View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
