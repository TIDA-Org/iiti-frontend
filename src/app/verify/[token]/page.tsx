'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  BookCheck,
  CarFront,
  CheckCircle2,
  CircleSlash,
  IdCard,
  Loader2,
  Shield,
  Sparkles,
  User,
} from 'lucide-react'

import { INSTITUTE_INFO } from '@/lib/constants'
import { apiVerify, type VerifyApiResponse } from '@/lib/api/verify'
import { formatDate, getInitials } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: { token: string }
}

const certificateTypeLabels: Record<string, string> = {
  institute: 'Institute Certificate',
  skill_id: 'Skill ID Card',
  nvq: 'NVQ Level 3 Certificate',
}

function normalizeToken(value: string) {
  try {
    return decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, '')
  } catch {
    return value.trim().replace(/^\/+|\/+$/g, '')
  }
}

function titleCase(value: string) {
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function normalizeError(message: unknown) {
  const text = message instanceof Error ? message.message : String(message ?? '')

  // Backend may return detailed validation errors; map common UUID validation
  // messages to a concise, user-friendly string.
  if (/valid UUID|invalid length|expected length/i.test(text)) {
    return 'The verification token in the link appears to be invalid. Please check the QR code or link and try again.'
  }

  if (text.trim()) return text
  return 'Failed to verify certificate.'
}

export default function VerifyCertificatePage({ params }: Props) {
  const token = normalizeToken(params.token)
  const [data, setData] = useState<VerifyApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setLoading(false)
      setError('The verification link is missing a token.')
      setData(null)
      return
    }

    let isActive = true

    const loadVerification = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiVerify(token)
        if (isActive) {
          setData(response)
        }
      } catch (fetchError) {
        if (isActive) {
          setError(normalizeError(fetchError))
          setData(null)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    loadVerification()

    return () => {
      isActive = false
    }
  }, [token])

  const certificate = data?.certificates[0] ?? null
  const isVerified = Boolean(certificate) && !certificate?.is_revoked && certificate?.status?.toLowerCase() !== 'revoked'
  const verificationTone = error ? 'error' : isVerified ? 'success' : data ? 'warning' : 'idle'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(180deg,_#fffaf4_0%,_#f8fafc_38%,_#ffffff_100%)] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/90 shadow-[0_24px_90px_-32px_rgba(120,53,15,0.28)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="relative overflow-hidden bg-stone-950 px-6 py-8 text-white sm:px-8 sm:py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.5),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.22),_transparent_28%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                    <Shield className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200/90">Certificate verification</p>
                    <h1 className="mt-1 text-2xl font-bold sm:text-3xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {INSTITUTE_INFO.shortName}
                    </h1>
                  </div>
                </div>

                <div className="max-w-2xl space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/85">
                    <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                    Scan a QR code or open the verification link to see certificate details instantly
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                    This page verifies the token in the URL against the backend and renders the official certificate, license, or result record returned by the institute.
                  </p>
                </div>

                {/* Informational badges removed per UI update request */}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 px-6 py-8 sm:px-8">
              <div>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${verificationTone === 'success' ? 'bg-emerald-100 text-emerald-700' : verificationTone === 'error' ? 'bg-rose-100 text-rose-700' : verificationTone === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-500'}`}>
                    {verificationTone === 'success' ? <CheckCircle2 className="h-5 w-5" /> : verificationTone === 'error' ? <AlertTriangle className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">Verification status</p>
                    <h2 className="text-lg font-semibold text-stone-900">
                      {loading ? 'Checking record' : error ? 'Verification failed' : isVerified ? 'Verified certificate' : data ? 'Record found' : 'Awaiting token'}
                    </h2>
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5">
                  {loading ? (
                    <div className="flex items-center gap-3 text-stone-600">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                      <div>
                        <p className="font-medium text-stone-800">Verifying token</p>
                        <p className="text-sm text-stone-500">Connecting to the backend verification endpoint.</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-2xl bg-rose-100 p-2 text-rose-700">
                          <CircleSlash className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">Unable to verify this QR link</p>
                          <p className="mt-1 text-sm leading-6 text-stone-600">{error}</p>
                        </div>
                      </div>
                      <p className="text-sm text-stone-500">If the token is correct and the problem persists, contact IITI support.</p>
                    </div>
                  ) : certificate ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Primary certificate</p>
                          <p className="mt-1 text-lg font-semibold text-stone-900">{certificateTypeLabels[certificate.cert_subtype] ?? titleCase(certificate.cert_subtype)}</p>
                        </div>
                        <StatusBadge status={certificate.status} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
                          <p className="text-xs text-stone-400">Certificate no.</p>
                          <p className="mt-1 font-mono text-sm font-semibold text-stone-900">{certificate.certificate_number}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
                          <p className="text-xs text-stone-400">Issued on</p>
                          <p className="mt-1 text-sm font-semibold text-stone-900">{certificate.issue_date ? formatDate(certificate.issue_date) : '-'}</p>
                        </div>
                      </div>
                      {certificate.is_revoked ? (
                        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                          <AlertTriangle className="h-4 w-4" />
                          This record is revoked.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-amber-100 p-2 text-amber-700">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">No verification data returned</p>
                        <p className="mt-1 text-sm leading-6 text-stone-600">The backend did not return a certificate record for this token.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-800">
                  <ArrowLeft className="h-4 w-4" />
                  Back to IITI Website
                </Link>
                <p className="text-center text-xs text-stone-400">{INSTITUTE_INFO.fullName}</p>
              </div>
            </div>
          </div>
        </section>

        {data && !error ? (
          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm lg:col-span-1">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-orange-700 ring-1 ring-orange-200">
                  {data.student.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.student.photo_url} alt={data.student.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">{getInitials(data.student.full_name || data.student.name_for_certificate)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Student</p>
                  <h3 className="mt-1 text-lg font-semibold text-stone-900">{data.student.full_name}</h3>
                  <p className="mt-1 text-sm text-stone-500">{data.student.name_for_certificate}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  { label: 'Student ID', value: data.student.student_number, icon: IdCard },
                  { label: 'NIC / National ID', value: data.student.nic_number, icon: User },
                  { label: 'Token', value: token, icon: Shield },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-stone-400">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </div>
                    <p className="mt-2 break-words text-sm font-semibold text-stone-900">{item.value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Verification details</p>
                  <h3 className="mt-1 text-lg font-semibold text-stone-900">Returned records</h3>
                </div>
                <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                  {data.certificates.length} certificate{data.certificates.length === 1 ? '' : 's'} · {data.licenses.length} license{data.licenses.length === 1 ? '' : 's'} · {data.results.length} result{data.results.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-stone-900">
                      <BookCheck className="h-4 w-4 text-orange-600" />
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Certificates</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {data.certificates.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-stone-900">{certificateTypeLabels[item.cert_subtype] ?? titleCase(item.cert_subtype)}</p>
                              <p className="mt-1 text-xs text-stone-500 font-mono">{item.certificate_number}</p>
                            </div>
                            <StatusBadge status={item.status} />
                          </div>
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                              <p className="text-xs text-stone-400">Issue date</p>
                              <p className="mt-1 text-sm font-medium text-stone-900">{item.issue_date ? formatDate(item.issue_date) : '-'}</p>
                            </div>
                            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                              <p className="text-xs text-stone-400">Revoked</p>
                              <p className={`mt-1 text-sm font-semibold ${item.is_revoked ? 'text-rose-700' : 'text-emerald-700'}`}>{item.is_revoked ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {data.certificates.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No certificate records were returned.</div>
                      ) : null}
                    </div>
                  </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-stone-900">
                    <CarFront className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Licenses</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.licenses.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">{titleCase(item.vehicle_type)}</p>
                            <p className="mt-1 text-xs text-stone-500 font-mono">{item.license_number}</p>
                          </div>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                            <p className="text-xs text-stone-400">Issue date</p>
                            <p className="mt-1 text-sm font-medium text-stone-900">{item.issue_date ? formatDate(item.issue_date) : '-'}</p>
                          </div>
                          <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                            <p className="text-xs text-stone-400">Expiry date</p>
                            <p className="mt-1 text-sm font-medium text-stone-900">{item.expiry_date ? formatDate(item.expiry_date) : '-'}</p>
                          </div>
                        </div>
                        <p className={`mt-3 text-sm font-semibold ${item.is_revoked ? 'text-rose-700' : 'text-emerald-700'}`}>{item.is_revoked ? 'Revoked' : 'Active'}</p>
                      </div>
                    ))}
                    {data.licenses.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No license records were returned.</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <div className="mb-3 flex items-center gap-2 text-stone-900">
                    <BadgeCheck className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Results</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.results.map((item) => (
                      <div key={item.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-stone-900">Examination result</p>
                            <p className="mt-1 text-xs text-stone-500">Published {item.is_published ? 'yes' : 'no'}</p>
                          </div>
                          <StatusBadge status={item.result_status} />
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                            <p className="text-xs text-stone-400">Final grade</p>
                            <p className="mt-1 text-sm font-semibold text-stone-900">{item.final_grade || '-'}</p>
                          </div>
                          <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">
                            <p className="text-xs text-stone-400">Score</p>
                            <p className="mt-1 text-sm font-semibold text-stone-900">{item.score_percentage != null ? `${item.score_percentage}%` : '-'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.results.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 p-4 text-sm text-stone-500 md:col-span-2">No result records were returned.</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  )
}
