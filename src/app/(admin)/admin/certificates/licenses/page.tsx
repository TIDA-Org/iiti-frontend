'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { formatDate } from '@/lib/utils'
import { apiGetStudents, apiReviewStudentPhoto, apiUploadStudentPhoto } from '@/lib/api/students'
import type { StudentApiResponse } from '@/lib/api/students'
import { apiGenerateLicense, apiRevokeLicense, apiGetLicenses } from '@/lib/api/licenses'
import type { LicenseApiResponse } from '@/lib/api/licenses'
import { apiGetEnrollments } from '@/lib/api/enrollments'
import type { EnrollmentApiResponse } from '@/lib/api/enrollments'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import { Button } from '@/components/ui/button'
import { ShieldCheck, AlertTriangle, Search, Award, Camera, CheckCircle2, XCircle, Clock, Upload, Eye } from 'lucide-react'

function statusBadge(status: string, isRevoked: boolean) {
  if (isRevoked) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">Revoked</span>
  if (status === 'generated') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Active</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{status}</span>
}

function photoStatusBadge(status?: string | null) {
  if (status === 'approved') return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Photo Approved</span>
  if (status === 'pending') return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending Review</span>
  if (status === 'rejected') return <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">No Photo</span>
}

export default function AdminLicensesPage() {
  const { isAdmin } = useRoleAccess()
  const [activeTab, setActiveTab] = useState<'licenses' | 'photo_reviews'>('licenses')

  // Student search
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<StudentApiResponse | null>(null)

  // Photo action states
  const [photoActionLoading, setPhotoActionLoading] = useState(false)
  const [photoMsg, setPhotoMsg] = useState<string | null>(null)

  // License generation
  const [enrollments, setEnrollments] = useState<EnrollmentApiResponse[]>([])
  const [loadingEnrollments, setLoadingEnrollments] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null) // enrollment_id being generated
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)

  // Revoke
  const [revokeTarget, setRevokeTarget] = useState<LicenseApiResponse | null>(null)
  const [revokeReason, setRevokeReason] = useState('')
  const [revoking, setRevoking] = useState(false)

  // Recent licenses (latest 20)
  const { data: recentLicenses, refetch: refetchLicenses } = useApi(
    () => apiGetLicenses(1, 20).catch(() => ({ items: [], total: 0, page: 1, per_page: 20, pages: 0 })),
    [],
  )

  // Pending photos queue
  const { data: pendingPhotosData, refetch: refetchPendingPhotos } = useApi(
    () => apiGetStudents(1, 50, undefined, 'pending').catch(() => ({ items: [], total: 0, page: 1, per_page: 50, pages: 0 })),
    [],
  )

  // Student search
  const { data: students } = useApi(
    () => search.length >= 2 ? apiGetStudents(1, 10, search) : Promise.resolve(null),
    [search],
  )

  const selectStudent = async (student: StudentApiResponse) => {
    setSelectedStudent(student)
    setEnrollments([])
    setGenerateMsg(null)
    setPhotoMsg(null)
    setLoadingEnrollments(true)
    try {
      const result = await apiGetEnrollments(student.id)
      setEnrollments(result)
    } catch {
      setEnrollments([])
    } finally {
      setLoadingEnrollments(false)
    }
  }

  const handleReviewPhoto = async (studentId: string, status: 'approved' | 'rejected') => {
    setPhotoActionLoading(true)
    setPhotoMsg(null)
    try {
      const updated = await apiReviewStudentPhoto(studentId, status)
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({
          ...selectedStudent,
          photo_status: updated.photo_status,
          photo_url: updated.photo_url,
        })
      }
      setPhotoMsg(`Photo ${status} successfully.`)
      refetchPendingPhotos()
    } catch (e: any) {
      setPhotoMsg(e?.message || 'Failed to review photo.')
    } finally {
      setPhotoActionLoading(false)
    }
  }

  const handleStaffPhotoUpload = async (studentId: string, file: File) => {
    setPhotoActionLoading(true)
    setPhotoMsg(null)
    try {
      const updated = await apiUploadStudentPhoto(studentId, file)
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({
          ...selectedStudent,
          photo_status: updated.photo_status,
          photo_url: updated.photo_url,
        })
      }
      setPhotoMsg('Photo uploaded and approved.')
      refetchPendingPhotos()
    } catch (e: any) {
      setPhotoMsg(e?.message || 'Photo upload failed.')
    } finally {
      setPhotoActionLoading(false)
    }
  }

  const handleGenerate = async (enrollmentId: string) => {
    setGenerating(enrollmentId)
    setGenerateMsg(null)
    try {
      await apiGenerateLicense(enrollmentId)
      setGenerateMsg('License generated successfully.')
      refetchLicenses()
    } catch (e: any) {
      setGenerateMsg(e?.message || 'Failed to generate license.')
    } finally {
      setGenerating(null)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget || !revokeReason.trim()) return
    setRevoking(true)
    try {
      await apiRevokeLicense(revokeTarget.id, revokeReason.trim())
      setRevokeTarget(null)
      setRevokeReason('')
      refetchLicenses()
    } catch {
      // keep dialog open
    } finally {
      setRevoking(false)
    }
  }

  const pendingCount = pendingPhotosData?.total ?? 0

  return (
    <div>
      <PageHeader
        title="License & Photo Management"
        subtitle="Manage student license photos, review submissions, and issue operator licenses"
      />

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mb-6 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('licenses')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${activeTab === 'licenses'
            ? 'border-amber-500 text-amber-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Award className="w-4 h-4" /> Generated Licenses & Issuance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photo_reviews')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors relative ${activeTab === 'photo_reviews'
            ? 'border-amber-500 text-amber-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
        >
          <Camera className="w-4 h-4" /> Photo Approval Queue
          {pendingCount > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'licenses' ? (
        <div className="grid xl:grid-cols-3 gap-6">

          {/* Left: generate */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" /> Generate License
              </h3>

              {/* Student search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name / NIC…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setSelectedStudent(null) }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-amber-400"
                />
              </div>

              {/* Search results */}
              {students && students.items.length > 0 && !selectedStudent && (
                <ul className="border border-slate-200 rounded-lg divide-y divide-slate-100 mb-3 max-h-48 overflow-y-auto">
                  {students.items.map(s => (
                    <li key={s.id}>
                      <button
                        type="button"
                        onClick={() => selectStudent(s)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-700">{s.full_name}</p>
                          <p className="text-xs text-slate-400">{s.student_number} · {s.nic_number}</p>
                        </div>
                        {photoStatusBadge(s.photo_status)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Selected student details & photo approval */}
              {selectedStudent && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-3">
                    {selectedStudent.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={selectedStudent.photo_url} alt="License photo" className="w-14 h-16 object-cover rounded-md border border-slate-200" />
                    ) : (
                      <div className="w-14 h-16 bg-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs font-semibold">
                        No Photo
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{selectedStudent.full_name}</p>
                      <p className="text-xs text-slate-500 font-mono">{selectedStudent.student_number}</p>
                      <div className="mt-1">{photoStatusBadge(selectedStudent.photo_status)}</div>
                    </div>
                  </div>

                  {/* Photo Inline Review Actions */}
                  <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                    <p className="text-xs font-semibold text-slate-700 mb-2">License Photo Status & Review</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedStudent.photo_status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={photoActionLoading}
                            onClick={() => handleReviewPhoto(selectedStudent.id, 'approved')}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Photo
                          </button>
                          <button
                            type="button"
                            disabled={photoActionLoading}
                            onClick={() => handleReviewPhoto(selectedStudent.id, 'rejected')}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject Photo
                          </button>
                        </>
                      )}

                      {selectedStudent.photo_status !== 'approved' && (
                        <label className="cursor-pointer text-xs px-2.5 py-1.5 rounded-lg bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors flex items-center gap-1">
                          <Upload className="w-3.5 h-3.5" /> Upload Photo
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            className="hidden"
                            onChange={e => {
                              const f = e.target.files?.[0]
                              if (f) handleStaffPhotoUpload(selectedStudent.id, f)
                            }}
                          />
                        </label>
                      )}
                    </div>
                    {photoMsg && (
                      <p className="text-xs mt-2 text-slate-600 font-medium">{photoMsg}</p>
                    )}
                  </div>

                  {/* Student enrollments */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Student Enrollments</h4>
                    {loadingEnrollments ? (
                      <p className="text-xs text-slate-400">Loading enrollments…</p>
                    ) : enrollments.length === 0 ? (
                      <p className="text-xs text-slate-400">No enrollments found for this student.</p>
                    ) : (
                      <div className="space-y-2">
                        {enrollments.map((enr: EnrollmentApiResponse) => (
                          <div key={enr.id} className="rounded-lg border border-slate-200 p-3 bg-white">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-xs text-slate-800 font-semibold">
                                  {enr.course?.short_name || enr.course?.name || enr.course_id}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">{enr.enrollment_number}</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  enr.enrollment_status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {enr.enrollment_status}
                                </span>
                              </div>
                              {enr.enrollment_status === 'completed' ? (
                                <button
                                  type="button"
                                  onClick={() => handleGenerate(enr.id)}
                                  disabled={generating === enr.id || selectedStudent.photo_status !== 'approved'}
                                  title={selectedStudent.photo_status !== 'approved' ? 'Student photo must be approved first' : 'Generate license for this enrollment'}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold flex items-center gap-1 shadow-sm"
                                >
                                  <Award className="w-3.5 h-3.5" />
                                  {generating === enr.id ? 'Generating…' : 'Generate License'}
                                </button>
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Not eligible</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {generateMsg && (
                      <p className={`text-xs mt-2 font-medium ${
                        generateMsg.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {generateMsg}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: license list */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Generated Licenses
                </h3>
              </div>

              {!recentLicenses || recentLicenses.items.length === 0 ? (
                <p className="text-center py-10 text-slate-400 text-sm">No licenses found.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentLicenses.items.map((lic) => (
                    <div key={lic.id} className="px-5 py-4 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-700">{lic.license_number}</span>
                          {statusBadge(lic.status, lic.is_revoked)}
                        </div>
                        <p className="text-xs text-slate-500">{lic.printed_name} · {lic.vehicle_type}</p>
                        <p className="text-xs text-slate-400">
                          Issued: {lic.issue_date ? formatDate(lic.issue_date) : '—'}
                        </p>
                        {lic.is_revoked && lic.revoke_reason && (
                          <p className="text-xs text-red-400 mt-0.5">Reason: {lic.revoke_reason}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {lic.license_card_url && (
                          <a href={lic.license_card_url} target="_blank" rel="noreferrer"
                            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 transition-colors">
                            Front
                          </a>
                        )}
                        {lic.license_pdf_url && (
                          <a href={lic.license_pdf_url} target="_blank" rel="noreferrer"
                            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 transition-colors">
                            Back
                          </a>
                        )}
                        {isAdmin && !lic.is_revoked && (
                          <button
                            type="button"
                            onClick={() => { setRevokeTarget(lic); setRevokeReason('') }}
                            className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Photo Approval Queue Tab */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Student License Photo Review Queue</h3>
              <p className="text-sm text-slate-500">Students who submitted license photos awaiting staff approval</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
              {pendingCount} Pending
            </span>
          </div>

          {!pendingPhotosData || pendingPhotosData.items.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-700">All Photo Submissions Reviewed!</h4>
              <p className="text-xs text-slate-400 mt-1">There are no pending student license photos requiring approval.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPhotosData.items.map((student) => (
                <div key={student.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex gap-4 items-start mb-4">
                      {student.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={student.photo_url}
                          alt={student.full_name}
                          className="w-24 h-32 object-cover rounded-lg border-2 border-amber-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-24 h-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                          No Photo
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 truncate">{student.full_name}</h4>
                        <p className="text-xs text-slate-500 font-mono">{student.student_number}</p>
                        <p className="text-xs text-slate-400 mt-1">NIC: {student.nic_number}</p>
                        <p className="text-xs text-slate-400">Phone: {student.phone_primary}</p>
                        <div className="mt-2">{photoStatusBadge(student.photo_status)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <a
                      href={`/admin/students/${student.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Profile
                    </a>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleReviewPhoto(student.id, 'rejected')}
                        disabled={photoActionLoading}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 font-medium transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewPhoto(student.id, 'approved')}
                        disabled={photoActionLoading}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revoke dialog */}
      {revokeTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-slate-800">Revoke License</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              You are about to revoke license <span className="font-mono font-medium">{revokeTarget.license_number}</span> for <strong>{revokeTarget.printed_name}</strong>. This cannot be undone.
            </p>
            <textarea
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              placeholder="Reason for revocation (required)…"
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg p-3 outline-none focus:border-red-300 resize-none mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
              <Button
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleRevoke}
                disabled={revoking || !revokeReason.trim()}
              >
                {revoking ? 'Revoking…' : 'Confirm Revoke'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

