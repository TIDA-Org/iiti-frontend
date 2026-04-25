'use client'

import { useState } from 'react'
import Link from 'next/link'
import { apiGetStudents, StudentApiResponse, StudentListApiResponse } from '@/lib/api/students'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { SearchInput } from '@/components/shared/SearchInput'
import { formatDate } from '@/lib/utils'
import { UserPlus, Eye } from 'lucide-react'

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useApi<StudentListApiResponse>(
    () => apiGetStudents(page, 20, search || undefined),
    [page, search],
  )

  const students = data?.items || []

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={data ? `${data.total} total students` : 'Loading...'}
        actions={
          <Link href="/admin/students/new" className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            <UserPlus className="w-4 h-4" /> Register Student
          </Link>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by name, NIC, Student ID, email..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{data?.total ?? 0} results</span>
        </div>

        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student ID</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">NIC</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">District</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map((student: StudentApiResponse) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-amber-600 font-medium">{student.student_number}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{student.full_name}</p>
                        <p className="text-xs text-slate-400">{student.email || '-'}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{student.nic_number}</td>
                    <td className="px-5 py-3 text-slate-500">{student.phone_primary}</td>
                    <td className="px-5 py-3 text-slate-500">{student.district}</td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(student.created_at)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/students/${student.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && !isLoading && (
              <div className="text-center py-12 text-slate-400 text-sm">No students found.</div>
            )}
          </div>
          {data && data.pages > 1 && (
            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">Page {data.page} of {data.pages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Previous</button>
                <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">Next</button>
              </div>
            </div>
          )}
        </DataLoader>
      </div>
    </div>
  )
}
