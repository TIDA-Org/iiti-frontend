import { MOCK_CERTIFICATES } from '@/lib/mock-data/certificates'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function AdminCertificatesPage() {
  const enriched = MOCK_CERTIFICATES.map(c => ({
    ...c,
    student: MOCK_STUDENTS.find(s => s.id === c.studentId),
    course: MOCK_COURSES.find(course => course.id === c.courseId),
  }))

  const certTypeLabel: Record<string, string> = { institute: 'Institute', skill_id: 'Skill ID', nvq: 'NVQ L3' }

  return (
    <div>
      <PageHeader title="Certificates" subtitle={`${MOCK_CERTIFICATES.length} certificates issued`} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Certificate No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Programme</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Type</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Issued</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {enriched.map(cert => (
                <tr key={cert.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-mono text-xs text-amber-600 font-medium">{cert.certificateNo}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{cert.student?.fullName}</p>
                    <p className="text-xs text-slate-400 font-mono">{cert.student?.studentId}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{cert.course?.name?.split(' ').slice(0, 2).join(' ')}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{certTypeLabel[cert.type] || cert.type}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-400 text-xs">{formatDate(cert.issuedAt)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={cert.isRevoked ? 'inactive' : 'active'} />
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/admin/certificates/${cert.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
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
