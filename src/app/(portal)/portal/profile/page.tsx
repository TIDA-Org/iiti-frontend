'use client'

import { useEffect, useState } from 'react'
import { apiGetMyProfile, StudentApiResponse, apiGetMyQr, apiRecreateStudentQr, StudentQrResponse } from '@/lib/api/students'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { User, Phone, Mail, MapPin, Calendar, QrCode } from 'lucide-react'
import { useRoleAccess } from '@/hooks/useRoleAccess'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function PortalProfilePage() {
  const [student, setStudent] = useState<StudentApiResponse | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [qrData, setQrData] = useState<StudentQrResponse | null>(null)
  const [isQrLoading, setIsQrLoading] = useState(false)
  const [isRecreating, setIsRecreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useRoleAccess()

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetMyProfile()
      setStudent(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const openQr = async () => {
    setQrOpen(true)
    setIsQrLoading(true)
    setQrData(null)
    try {
      const data = await apiGetMyQr()
      setQrData(data)
    } catch (e) {
      // ignore error for now
    } finally {
      setIsQrLoading(false)
    }
  }

  const recreateQr = async () => {
    if (!student) return
    setIsRecreating(true)
    try {
      const data = await apiRecreateStudentQr(student.id)
      setQrData(data)
    } catch (e) {
      // ignore
    } finally {
      setIsRecreating(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>My Profile</h1>
        <p className="text-stone-500 text-sm mt-1">Your personal information on record</p>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={fetchProfile}>
        {student && (() => {
          const fields = [
            { icon: User, label: 'Full Name', value: student.full_name },
            { icon: User, label: 'Name for Certificate', value: student.name_for_certificate },
            { icon: User, label: 'NIC Number', value: student.nic_number },
            { icon: Calendar, label: 'Date of Birth', value: formatDate(student.date_of_birth) },
            { icon: User, label: 'Gender', value: student.gender.charAt(0).toUpperCase() + student.gender.slice(1) },
            { icon: Phone, label: 'Phone', value: student.phone_primary },
            { icon: Mail, label: 'Email', value: student.email || '-' },
            { icon: MapPin, label: 'Address', value: [student.address_line1, student.city, student.district].filter(Boolean).join(', ') },
            { icon: MapPin, label: 'Province', value: student.province },
          ]

          return (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-white font-bold text-2xl">{student.full_name[0]}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{student.full_name}</h2>
                      <p className="text-orange-100 text-sm">{student.student_number}</p>
                    </div>
                    </div>
                    <div className="ml-4">
                      <Dialog open={qrOpen} onOpenChange={(open) => { if (!open) setQrData(null); setQrOpen(open) }}>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            aria-label="View QR code"
                            onClick={openQr}
                            className="w-10 h-10 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
                          >
                            <QrCode className="w-5 h-5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Student QR Code</DialogTitle>
                            <DialogDescription>Scan to verify your student identity or recreate a new code.</DialogDescription>
                          </DialogHeader>

                          <div className="py-4">
                            {isQrLoading ? (
                              <div className="flex items-center justify-center p-6">Loading...</div>
                            ) : qrData ? (
                              <div className="flex flex-col items-center gap-4">
                                {qrData.qr_code_image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={qrData.qr_code_image_url} alt="QR code" className="w-48 h-48 bg-white p-2 rounded-md" />
                                ) : (
                                  <div className="text-sm text-stone-600">Token: <span className="font-mono">{qrData.qr_code_token}</span></div>
                                )}
                                <a href={`/verify/${qrData.qr_code_token}`} target="_blank" rel="noreferrer" className="text-sm underline text-sky-600">Open verification link</a>
                              </div>
                            ) : (
                              <div className="text-sm text-stone-500">Unable to load QR data.</div>
                            )}
                          </div>

                            <DialogFooter>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => setQrOpen(false)}>Close</Button>
                                {isAdmin && (
                                  <Button disabled={isRecreating} onClick={recreateQr}>{isRecreating ? 'Recreating...' : 'Recreate QR'}</Button>
                                )}
                              </div>
                            </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                </div>
              </div>
              <div className="p-6 grid md:grid-cols-2 gap-x-8 gap-y-5">
                {fields.map(field => {
                  const Icon = field.icon
                  return (
                    <div key={field.label} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-stone-400" />
                      </div>
                      <div>
                        <p className="text-xs text-stone-400">{field.label}</p>
                        <p className="text-sm font-medium text-stone-700">{field.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="px-6 pb-6">
                <p className="text-xs text-stone-400">To update your information, please contact IITI reception: 0113 482 555</p>
              </div>
            </div>
          )
        })()}
      </DataLoader>
    </div>
  )
}
