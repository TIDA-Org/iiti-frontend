import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_RESULTS } from '@/lib/mock-data/results'
import { MOCK_CERTIFICATES } from '@/lib/mock-data/certificates'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, formatLKR } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { User, Phone, Mail, MapPin, Edit } from 'lucide-react'
import { GRADE_COLORS } from '@/lib/constants'

interface Props { params: { id: string } }

export default function AdminStudentDetailPage({ params }: Props) {
  const student = MOCK_STUDENTS.find(s => s.id === params.id)
  if (!student) notFound()

  const enrollments = MOCK_ENROLLMENTS.filter(e => e.studentId === student.id)
  const payments = MOCK_PAYMENTS.filter(p => p.studentId === student.id)
  const results = MOCK_RESULTS.filter(r => r.studentId === student.id)
  const certs = MOCK_CERTIFICATES.filter(c => c.studentId === student.id)

  const paidTotal = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div>
      <PageHeader
        title={student.fullName}
        subtitle={student.studentId}
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
              <span className="text-amber-600 font-bold text-xl">{student.fullName[0]}</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{student.fullName}</h3>
              <StatusBadge status={student.status} className="mt-1" />
            </div>
          </div>
          <div className="space-y-3 text-sm">
            {[
              { icon: User, label: 'NIC', value: student.nic },
              { icon: Phone, label: 'Phone', value: student.phone },
              { icon: Mail, label: 'Email', value: student.email },
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
              <p className="font-medium text-slate-700">{formatDate(student.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollments */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-700">Enrollments ({enrollments.length})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {enrollments.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No enrollments</p>
              ) : (
                enrollments.map(e => {
                  const course = MOCK_COURSES.find(c => c.id === e.courseId)
                  return (
                    <div key={e.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700 text-sm">{course?.name}</p>
                        <p className="text-xs text-slate-400">Enrolled: {formatDate(e.enrolledAt)} · Plan: {e.paymentPlan}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Payments */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-semibold text-slate-700">Payments</h3>
              <span className="text-sm font-semibold text-green-600">{formatLKR(paidTotal)} paid</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-2.5 text-xs text-slate-400 font-semibold uppercase">Receipt</th>
                    <th className="text-left px-5 py-2.5 text-xs text-slate-400 font-semibold uppercase">Amount</th>
                    <th className="text-left px-5 py-2.5 text-xs text-slate-400 font-semibold uppercase">Date</th>
                    <th className="text-left px-5 py-2.5 text-xs text-slate-400 font-semibold uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td className="px-5 py-2.5 font-mono text-xs text-slate-500">{p.receiptNo}</td>
                      <td className="px-5 py-2.5 font-semibold text-slate-800">{formatLKR(p.amount)}</td>
                      <td className="px-5 py-2.5 text-slate-400 text-xs">{p.paidAt ? formatDate(p.paidAt) : `Due: ${formatDate(p.dueDate || '')}`}</td>
                      <td className="px-5 py-2.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Results & Certs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Results ({results.length})</h3>
              {results.length === 0 ? <p className="text-sm text-slate-400">No results</p> : results.map(r => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm text-slate-600">{MOCK_COURSES.find(c => c.id === r.courseId)?.name?.split(' ')[0]}</p>
                    <p className="text-xs text-slate-400">{r.isPublished ? 'Published' : 'Pending'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${GRADE_COLORS[r.finalGrade] || 'bg-stone-100'}`}>{r.finalGrade}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3">Certificates ({certs.length})</h3>
              {certs.length === 0 ? <p className="text-sm text-slate-400">No certificates issued</p> : certs.map(c => (
                <div key={c.id} className="py-2 border-b border-slate-50 last:border-0">
                  <p className="text-sm text-slate-600 font-mono">{c.certificateNo}</p>
                  <p className="text-xs text-slate-400 capitalize">{c.type.replace('_', ' ')} · {formatDate(c.issuedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
