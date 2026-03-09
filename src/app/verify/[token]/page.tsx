import { MOCK_CERTIFICATES } from '@/lib/mock-data/certificates'
import { MOCK_STUDENTS } from '@/lib/mock-data/students'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { MOCK_RESULTS } from '@/lib/mock-data/results'
import { formatDate } from '@/lib/utils'
import { CheckCircle, XCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { INSTITUTE_INFO } from '@/lib/constants'

interface Props { params: { token: string } }

export default function VerifyCertificatePage({ params }: Props) {
  const cert = MOCK_CERTIFICATES.find(c => c.verifyToken === params.token && !c.isRevoked)
  const student = cert ? MOCK_STUDENTS.find(s => s.id === cert.studentId) : null
  const course = cert ? MOCK_COURSES.find(c => c.id === cert.courseId) : null
  const result = cert ? MOCK_RESULTS.find(r => r.id === cert.resultId) : null

  const certTypeLabel: Record<string, string> = { institute: 'Institute Certificate', skill_id: 'Skill ID Card', nvq: 'NVQ Level 3 Certificate' }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI</span>
          </div>
          <h1 className="text-lg font-semibold text-stone-700">Certificate Verification</h1>
          <p className="text-stone-400 text-sm">{INSTITUTE_INFO.fullName}</p>
        </div>

        {cert && student && course ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
            <div className="bg-green-500 p-6 text-white text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-2" />
              <h2 className="text-xl font-bold">Verified Certificate</h2>
              <p className="text-green-100 text-sm mt-1">This certificate is authentic and valid</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Student Name', value: student.fullName },
                  { label: 'Programme', value: course.name },
                  { label: 'Certificate Type', value: certTypeLabel[cert.type] || cert.type },
                  { label: 'Certificate No', value: cert.certificateNo },
                  { label: 'Issue Date', value: formatDate(cert.issuedAt) },
                  { label: 'Grade', value: result?.finalGrade || 'Pass' },
                ].map(item => (
                  <div key={item.label} className="bg-stone-50 rounded-xl p-3">
                    <p className="text-xs text-stone-400 mb-0.5">{item.label}</p>
                    <p className="font-semibold text-stone-800 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6">
              <Link href="/" className="block w-full text-center bg-stone-800 hover:bg-stone-900 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                Back to IITI Website
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden">
            <div className="bg-red-500 p-6 text-white text-center">
              <XCircle className="w-12 h-12 mx-auto mb-2" />
              <h2 className="text-xl font-bold">Certificate Not Found</h2>
              <p className="text-red-100 text-sm mt-1">This QR code does not match any certificate in our system</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-stone-500 text-sm mb-6">If you believe this is an error, please contact IITI directly.</p>
              <div className="space-y-2 text-sm text-stone-600">
                <p>Tel: {INSTITUTE_INFO.telephone}</p>
                <p>Mobile: {INSTITUTE_INFO.mobile}</p>
                <p>Email: {INSTITUTE_INFO.email}</p>
              </div>
              <Link href="/" className="mt-6 block w-full text-center bg-stone-800 hover:bg-stone-900 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                Back to IITI Website
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
