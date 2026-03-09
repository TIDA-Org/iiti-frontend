'use client'

import { useState } from 'react'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function AdminEnrollmentsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const enriched = MOCK_ENROLLMENTS.map(e => ({
    ...e,
    student: MOCK_STUDENTS.find(s => s.id === e.studentId),
    course: MOCK_COURSES.find(c => c.id === e.courseId),
  }))

  const filtered = enriched.filter(e => {
    const matchSearch = !search ||
      e.student?.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.course?.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const pending = MOCK_ENROLLMENTS.filter(e => e.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle={pending > 0 ? `${pending} pending approval` : 'All enrollment records'}
      />

      {pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-amber-800">{pending} enrollment(s) waiting for approval</p>
          <button onClick={() => setStatusFilter('pending')} className="text-xs bg-amber-500 text-white px-3 py-1.5 rounded-lg font-semibold">View Pending</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search student or course..." className="max-w-xs" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="all">All Status</option>
            {['pending', 'approved', 'active', 'completed', 'rejected', 'withdrawn'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Course</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Plan</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Enrolled</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(e => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{e.student?.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">{e.student?.studentId}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-slate-600 text-sm">{e.course?.name?.split(' ').slice(0, 3).join(' ')}</p>
                    <p className="text-xs text-slate-400">{e.course?.code}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{e.paymentPlan}{e.installments ? ` (${e.installments}x)` : ''}</td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(e.enrolledAt)}</td>
                  <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/enrollments/${e.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
