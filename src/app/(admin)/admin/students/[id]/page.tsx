'use client'

import { useEffect, useState, use } from 'react'
import { apiGetStudent, StudentApiResponse } from '@/lib/api/students'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { User, Phone, Mail, MapPin, Edit } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export default function AdminStudentDetailPage({ params }: Props) {
  const { id } = use(params)
  const [student, setStudent] = useState<StudentApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudent = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetStudent(id)
      setStudent(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load student')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchStudent() }, [id])

  return (
    <DataLoader isLoading={isLoading} error={error} onRetry={fetchStudent}>
      {student && (
        <div>
          <PageHeader
            title={student.full_name}
            subtitle={student.student_number}
            actions={
              <Link href={`/admin/students/${student.id}/edit`} className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                <Edit className="w-4 h-4" /> Edit
              </Link>
            }
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 font-bold text-xl">{student.full_name[0]}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{student.full_name}</h3>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { icon: User, label: 'NIC', value: student.nic_number },
                  { icon: Phone, label: 'Phone', value: student.phone_primary },
                  { icon: Mail, label: 'Email', value: student.email || '-' },
                  { icon: MapPin, label: 'Location', value: `${student.city}, ${student.district}` },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex gap-3 items-start">
                      <Icon className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-400">{item.label}</p>
                        <p className="font-medium text-slate-700">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Registered on</p>
                  <p className="font-medium text-slate-700">{formatDate(student.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Enrollments placeholder */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700">Enrollments</h3>
                </div>
                <p className="text-center py-6 text-slate-400 text-sm">Enrollment data will be available when the API is connected.</p>
              </div>

              {/* Payments placeholder */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700">Payments</h3>
                </div>
                <p className="text-center py-6 text-slate-400 text-sm">Payment data will be available when the API is connected.</p>
              </div>

              {/* Guarantors */}
              {student.guarantors.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">Guarantors ({student.guarantors.length})</h3>
                  {student.guarantors.map(g => (
                    <div key={g.id} className="py-2 border-b border-slate-50 last:border-0">
                      <p className="text-sm text-slate-600">{g.full_name}</p>
                      <p className="text-xs text-slate-400">{g.relationship_to} · {g.phone || '-'}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents */}
              {student.documents.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-700 mb-3">Documents ({student.documents.length})</h3>
                  {student.documents.map(d => (
                    <div key={d.id} className="py-2 border-b border-slate-50 last:border-0 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-slate-600 capitalize">{d.doc_type.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-400">{d.original_name || 'Uploaded'} · {formatDate(d.uploaded_at)}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${d.is_verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {d.is_verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DataLoader>
  )
}
