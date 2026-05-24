'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, BookCheck, CheckCircle2, CircleSlash, IdCard, Loader2, Shield, Sparkles, User } from 'lucide-react'

import { INSTITUTE_INFO } from '@/lib/constants'
import { apiVerify, type VerifyQrApiResponse } from '@/lib/api/verify'
import { formatDate, getInitials } from '@/lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

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

  if (/valid UUID|invalid length|expected length/i.test(text)) {
    return 'The verification token in the link appears to be invalid. Please check the QR code or link and try again.'
  }

  if (text.trim()) return text
  return 'Failed to verify certificate.'
}

export default function VerifyCertificatePage({ params }: Props) {
  const token = normalizeToken(params.token)
  const [data, setData] = useState<VerifyQrApiResponse | null>(null)
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

  const certificate = data?.certificate ?? null
  const student = data?.student ?? null
  const isVerified = Boolean(certificate) && !certificate?.is_revoked && (certificate?.status ?? '').toLowerCase() !== 'revoked'
  const verificationTone = error ? 'error' : isVerified ? 'success' : data ? 'warning' : 'idle'
  const certificateStatusLabel = certificate?.is_revoked ? 'Revoked' : certificate?.status ? titleCase(certificate.status) : 'Active'

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(180deg,_#fffaf4_0%,_#f8fafc_38%,_#ffffff_100%)] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white/90 shadow-[0_24px_90px_-32px_rgba(120,53,15,0.28)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="relative overflow-hidden rounded-none border-0 bg-stone-950 px-0 py-0 text-white shadow-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.5),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.22),_transparent_28%)]" />
              <CardContent className="relative z-10 flex h-full flex-col justify-between gap-8 px-6 py-8 sm:px-8 sm:py-10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12 ring-1 ring-white/15">
                    <Shield className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <CardDescription className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-200/90">Certificate verification</CardDescription>
                    <CardTitle className="mt-1 text-2xl font-bold text-white sm:text-3xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {INSTITUTE_INFO.shortName}
                    </CardTitle>
                  </div>
                </div>

                <div className="max-w-2xl space-y-4">
                  <Badge variant="outline" className="border-white/15 bg-white/8 px-3 py-1 text-xs font-medium text-white/85 hover:bg-white/12">
                    <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                    Scan a QR code or open the verification link to see certificate details instantly
                  </Badge>
                  <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-base">
                    This page verifies the token in the URL against the backend and renders the official student and certificate record returned by the institute.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col justify-between gap-6 border-0 px-0 py-0 shadow-none">
              <CardContent className="flex flex-col justify-between gap-6 px-6 py-8 sm:px-8">
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

                <Card className="rounded-3xl border-stone-200 bg-stone-50/80 shadow-none">
                  <CardContent className="p-5">
                  {loading ? (
                    <div className="flex items-center gap-3 text-stone-600">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                      <div>
                        <CardTitle className="text-base font-medium text-stone-800">Verifying token</CardTitle>
                        <p className="text-sm text-stone-500">Connecting to the backend verification endpoint.</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="space-y-3">
                      <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-800">
                        <CircleSlash className="h-4 w-4 text-rose-700" />
                        <AlertTitle>Unable to verify this QR link</AlertTitle>
                        <AlertDescription className="text-rose-700">{error}</AlertDescription>
                      </Alert>
                      <p className="text-sm text-stone-500">If the token is correct and the problem persists, contact IITI support.</p>
                    </div>
                  ) : certificate ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardDescription className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Primary certificate</CardDescription>
                          <CardTitle className="mt-1 text-lg font-semibold text-stone-900">{certificateTypeLabels[certificate.cert_subtype] ?? titleCase(certificate.cert_subtype)}</CardTitle>
                        </div>
                        <Badge variant={certificate.is_revoked ? 'destructive' : 'secondary'} className="rounded-full px-3 py-1">
                          {certificateStatusLabel}
                        </Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Card className="rounded-2xl border-stone-200 shadow-none">
                          <CardContent className="p-3">
                            <CardDescription className="text-xs text-stone-400">Certificate no.</CardDescription>
                            <CardTitle className="mt-1 font-mono text-sm font-semibold text-stone-900">{certificate.certificate_number}</CardTitle>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-stone-200 shadow-none">
                          <CardContent className="p-3">
                            <CardDescription className="text-xs text-stone-400">Issued on</CardDescription>
                            <CardTitle className="mt-1 text-sm font-semibold text-stone-900">{certificate.issue_date ? formatDate(certificate.issue_date) : '-'}</CardTitle>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-stone-200 shadow-none">
                          <CardContent className="p-3">
                            <CardDescription className="text-xs text-stone-400">Course name</CardDescription>
                            <CardTitle className="mt-1 text-sm font-semibold text-stone-900">{data?.course_name || '-'}</CardTitle>
                          </CardContent>
                        </Card>
                        <Card className="rounded-2xl border-stone-200 shadow-none">
                          <CardContent className="p-3">
                            <CardDescription className="text-xs text-stone-400">Enrollment no.</CardDescription>
                            <CardTitle className="mt-1 text-sm font-semibold text-stone-900">{data?.enrollment_number || '-'}</CardTitle>
                          </CardContent>
                        </Card>
                      </div>
                      {certificate.is_revoked ? (
                        <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-800">
                          <AlertTriangle className="h-4 w-4 text-rose-700" />
                          <AlertTitle>Revoked</AlertTitle>
                          <AlertDescription className="text-rose-700">This record is revoked.</AlertDescription>
                        </Alert>
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
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>

        {data && !error ? (
          <section className="grid gap-6 lg:grid-cols-3">
            <Card className="rounded-[1.75rem] border-stone-200 shadow-sm lg:col-span-1">
              <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-orange-100 text-orange-700 ring-1 ring-orange-200">
                  {student?.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={student.photo_url} alt={student.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">{getInitials(student?.full_name || student?.name_for_certificate)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Student</p>
                  <h3 className="mt-1 text-lg font-semibold text-stone-900">{student?.full_name || '-'}</h3>
                  <p className="mt-1 text-sm text-stone-500">{student?.name_for_certificate || '-'}</p>
                </div>
              </div>

              <Separator className="my-5 bg-stone-200" />

              <div className="grid gap-3">
                {[
                  { label: 'Student ID', value: student?.student_number, icon: IdCard },
                  { label: 'NIC / National ID', value: student?.nic_number, icon: User },
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
              </CardContent>
            </Card>

            <Card className="rounded-[1.75rem] border-stone-200 shadow-sm lg:col-span-2">
              <CardContent className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">Verification details</CardDescription>
                  <CardTitle className="mt-1 text-lg font-semibold text-stone-900">Returned certificate</CardTitle>
                </div>
                <Badge variant={certificate?.is_revoked ? 'destructive' : 'secondary'} className="rounded-full px-3 py-1">{certificate?.is_revoked ? 'Revoked' : 'Active'}</Badge>
              </div>

              <Separator className="my-4 bg-stone-200" />

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-stone-900">
                    <BookCheck className="h-4 w-4 text-orange-600" />
                    <CardDescription className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Certificate</CardDescription>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-3xl border-stone-200 bg-stone-50 shadow-none md:col-span-2">
                      <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-sm font-semibold text-stone-900">{certificateTypeLabels[certificate?.cert_subtype ?? ''] ?? titleCase(certificate?.cert_subtype ?? '')}</CardTitle>
                          <CardDescription className="mt-1 font-mono text-xs text-stone-500">{certificate?.certificate_number || '-'}</CardDescription>
                        </div>
                        {certificate ? <Badge variant={certificate.is_revoked ? 'destructive' : 'outline'}>{certificateStatusLabel}</Badge> : null}
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {[
                          { label: 'Printed name', value: certificate?.printed_name || '-' },
                          { label: 'Printed NIC', value: certificate?.printed_nic_number || '-' },
                          { label: 'Course name', value: data?.course_name || '-' },
                          { label: 'Enrollment no.', value: data?.enrollment_number || '-' },
                          { label: 'Grade', value: certificate?.grade || '-' },
                          { label: 'Issue date', value: certificate?.issue_date ? formatDate(certificate.issue_date) : '-' },
                        ].map((item) => (
                          <Card key={item.label} className="rounded-2xl border-stone-200 bg-white shadow-none">
                            <CardContent className="p-3">
                              <CardDescription className="text-xs text-stone-400">{item.label}</CardDescription>
                              <CardTitle className="mt-1 text-sm font-medium text-stone-900">{item.value}</CardTitle>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                    </Card>
                  </div>
                </div>

                {certificate?.is_revoked ? (
                  <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-800">
                    <AlertTriangle className="h-4 w-4 text-rose-700" />
                    <AlertTitle>Revoked</AlertTitle>
                    <AlertDescription className="text-rose-700">This certificate has been revoked according to the backend response.</AlertDescription>
                  </Alert>
                ) : null}
              </div>
              </CardContent>
            </Card>
          </section>
        ) : null}
      </div>
    </div>
  )
}
