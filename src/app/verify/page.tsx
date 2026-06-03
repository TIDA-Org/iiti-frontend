"use client"

import { FormEvent, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertTriangle, BadgeCheck, BookCheck, CarFront, Loader2, UsersRound } from 'lucide-react'

import { apiVerifyManual, type VerifyApiResponse, type VerifyManualParams } from '@/lib/api/verify'
import { formatDate, getInitials } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type ManualFormState = VerifyManualParams

const certificateTypeLabels: Record<string, string> = {
  institute: 'Institute Certificate',
  skill_id: 'Skill ID Card',
  nvq: 'NVQ Level 3 Certificate',
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to verify record'
}

function Field({ label, name, value, onChange, placeholder }: { label: string; name: keyof ManualFormState; value: string; onChange: (name: keyof ManualFormState, value: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{label}</span>
      <Input
        name={String(name)}
        value={value}
        onChange={(event) => onChange(name, (event.target as HTMLInputElement).value)}
        placeholder={placeholder}
        className="rounded-2xl"
      />
    </label>
  )
}

export default function VerifyEntryPage() {
  const searchParams = useSearchParams()

  const [form, setForm] = useState<ManualFormState>({
    student_number: '',
    nic_number: '',
    certificate_number: '',
    enrollment_number: '',
  })
  const [data, setData] = useState<VerifyApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fetch when ?student_token=UUID is present (QR code redirect)
  useEffect(() => {
    const token = searchParams.get('student_token')
    if (!token) return

    let isActive = true

    const fetchByToken = async () => {
      setLoading(true)
      setError(null)
      setData(null)

      try {
        const response = await apiVerifyManual({ student_token: token })
        if (isActive) setData(response)
      } catch (fetchError) {
        if (isActive) setError(normalizeError(fetchError))
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchByToken()

    return () => {
      isActive = false
    }
  }, [searchParams])

  const updateField = (name: keyof ManualFormState, value: string) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const hasValue = Object.values(form).some((value) => value?.trim())
    if (!hasValue) {
      setError('Enter at least one search field.')
      setData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await apiVerifyManual(form)
      setData(response)
    } catch (fetchError) {
      setData(null)
      setError(normalizeError(fetchError))
    } finally {
      setLoading(false)
    }
  }


  const certificate = data?.certificates?.[0] ?? null
  const license = data?.licenses?.[0] ?? null
  const result = data?.results?.[0] ?? null
  const student = data?.student ?? null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(180deg,_#fffaf4_0%,_#f8fafc_38%,_#ffffff_100%)] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-6">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Search certificates</p>
              <h3 className="mt-1 text-lg font-semibold text-stone-900">Enter Student ID, NIC, Certificate no. or Enrollment no.</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Student number" name="student_number" value={form.student_number ?? ''} onChange={updateField} placeholder="STU-2026-001" />
              <Field label="NIC number" name="nic_number" value={form.nic_number ?? ''} onChange={updateField} placeholder="199912345678" />
              <Field label="Certificate number" name="certificate_number" value={form.certificate_number ?? ''} onChange={updateField} placeholder="CERT-000123" />
              <Field label="Enrollment number" name="enrollment_number" value={form.enrollment_number ?? ''} onChange={updateField} placeholder="ENR-000123" />

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button className="flex-1" type="submit">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Verify record
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm({ student_number: '', nic_number: '', certificate_number: '', enrollment_number: '' })
                    setData(null)
                    setError(null)
                  }}
                >
                  Clear
                </Button>
              </div>
              {error ? (
                <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
            </form>
          </div>

          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <h3 className="mt-1 text-lg font-semibold text-stone-900">Search results</h3>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                {data ? 'Loaded' : 'Waiting'}
              </div>
            </div>

            <div className="mt-5 space-y-6">
              <div>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-orange-700 ring-1 ring-orange-200">
                    {student?.photo_url ? (
                      <Avatar className="h-full w-full">
                        <AvatarImage src={student.photo_url} alt={student.full_name || student?.name_for_certificate || 'Student photo'} />
                        <AvatarFallback>{getInitials(student?.full_name || student?.name_for_certificate)}</AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(student?.full_name || student?.name_for_certificate)}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Student</p>
                    <h4 className="mt-1 text-base font-semibold text-stone-900">{student?.full_name || '-'}</h4>
                    <p className="mt-1 text-sm text-stone-500">{student?.name_for_certificate || '-'}</p>
                  </div>
                </div>

                <dl className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-stone-500">Student number</dt>
                    <dd className="text-sm font-medium text-stone-900">{student?.student_number ?? '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-stone-500">NIC number</dt>
                    <dd className="text-sm font-medium text-stone-900">{student?.nic_number ?? '-'}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-stone-900">
                  <BookCheck className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Certificates</p>
                </div>
                <div className="space-y-3">
                  {(data?.certificates ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{certificateTypeLabels[item.cert_subtype] ?? titleCase(item.cert_subtype)}</p>
                          <p className="mt-1 text-xs font-mono text-stone-500">{item.certificate_number}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>

                      <dl className="mt-4 divide-y divide-stone-100">
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Printed name</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.printed_name || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Printed NIC</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.printed_nic_number || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Course name</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.course_name || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Enrollment no.</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.enrollment_number || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Grade</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.grade || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Issue date</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.issue_date ? formatDate(item.issue_date) : '-'}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <span className={`rounded-full px-3 py-1 font-semibold ${item.is_revoked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {item.is_revoked ? 'Revoked' : 'Active'}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-stone-700">{item.status}</span>
                      </div>
                    </div>
                  ))}
                  {!loading && data && data.certificates?.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No certificate records were returned.</div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-stone-900">
                  <CarFront className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Licenses</p>
                </div>
                <div className="space-y-3">
                  {(data?.licenses ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{titleCase(item.vehicle_type)}</p>
                          <p className="mt-1 text-xs font-mono text-stone-500">{item.license_number}</p>
                        </div>
                        <StatusBadge status={item.status} />
                      </div>
                      <dl className="mt-4 divide-y divide-stone-100">
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Issue date</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.issue_date ? formatDate(item.issue_date) : '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Expiry date</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.expiry_date ? formatDate(item.expiry_date) : '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Revoked</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.is_revoked ? 'Yes' : 'No'}</dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                  {!loading && data && data.licenses?.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No license records were returned.</div>
                  ) : null}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-stone-900">
                  <BadgeCheck className="h-4 w-4 text-orange-600" />
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Exam results</p>
                </div>
                <div className="space-y-3">
                  {(data?.results ?? []).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4">
                      <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">Examination result</p>
                          <p className="mt-1 text-xs text-stone-500">Published {item.is_published ? 'yes' : 'no'}</p>
                        </div>
                        <StatusBadge status={item.result_status} />
                      </div>

                      <dl className="mt-4 divide-y divide-stone-100">
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Final grade</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.final_grade || '-'}</dd>
                        </div>
                        <div className="flex items-center justify-between gap-4 py-2">
                          <dt className="text-sm text-stone-500">Score</dt>
                          <dd className="text-sm font-medium text-stone-900">{item.score_percentage != null ? `${item.score_percentage}%` : '-'}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm">
                        <span className={`rounded-full px-3 py-1 font-semibold ${item.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.is_published ? 'Published' : 'Hidden'}
                        </span>
                        <span className="rounded-full bg-stone-100 px-3 py-1 font-semibold text-stone-700">{item.result_status}</span>
                      </div>
                    </div>
                  ))}
                  {!loading && data && data.results?.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No result records were returned.</div>
                  ) : null}
                </div>
              </div>

              {!data && !loading ? (
                <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500">
                  <div className="flex items-start gap-3">
                    <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />
                    <p>No checks yet. Enter one or more fields and submit.</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}