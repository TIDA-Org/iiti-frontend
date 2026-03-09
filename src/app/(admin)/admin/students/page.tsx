'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDate } from '@/lib/utils'
import { UserPlus, Eye } from 'lucide-react'

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const filtered = MOCK_STUDENTS.filter(s =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.nic.includes(search) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${MOCK_STUDENTS.length} total students`}
        actions={
          <Link href="/admin/students/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <UserPlus className="w-4 h-4" /> Register Student
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, NIC, Student ID, email..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{filtered.length} results</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">NIC</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">District</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(student => (
                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-amber-600 font-medium">{student.studentId}</td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{student.fullName}</p>
                      <p className="text-xs text-slate-400">{student.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{student.nic}</td>
                  <td className="px-5 py-3 text-slate-500">{student.phone}</td>
                  <td className="px-5 py-3 text-slate-500">{student.district}</td>
                  <td className="px-5 py-3"><StatusBadge status={student.status} /></td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(student.createdAt)}</td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/students/${student.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">No students found matching your search.</div>
          )}
        </div>
      </div>
    </div>
  )
}
