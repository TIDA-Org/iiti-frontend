'use client'

import { useEffect, useState } from 'react'
import {
  apiGetMyProfile,
  StudentApiResponse,
  apiGetMyPhoto,
  apiUploadMyPhoto,
  StudentPhotoApiResponse,
} from '@/lib/api/students'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { User, Phone, Mail, MapPin, Calendar, Camera, CheckCircle2, Clock, XCircle, UploadCloud, AlertCircle } from 'lucide-react'

import { useTranslation } from '@/lib/i18n/useTranslation'

export default function PortalProfilePage() {
  const { t } = useTranslation()
  const [student, setStudent] = useState<StudentApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Photo state
  const [photoData, setPhotoData] = useState<StudentPhotoApiResponse | null>(null)
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchProfile = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [profileRes, photoRes] = await Promise.allSettled([
        apiGetMyProfile(),
        apiGetMyPhoto(),
      ])
      if (profileRes.status === 'fulfilled') {
        setStudent(profileRes.value)
      } else {
        throw profileRes.reason
      }
      if (photoRes.status === 'fulfilled') {
        setPhotoData(photoRes.value)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setPhotoMessage({ type: 'error', text: 'Only JPG and PNG images are allowed.' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoMessage({ type: 'error', text: 'Photo must be 5 MB or smaller.' })
      return
    }

    setIsPhotoUploading(true)
    setPhotoMessage(null)

    try {
      const updated = await apiUploadMyPhoto(file)
      setPhotoData(updated)
      setPhotoMessage({ type: 'success', text: 'Photo uploaded successfully! Staff review is pending.' })
    } catch (err: any) {
      setPhotoMessage({ type: 'error', text: err?.message || 'Failed to upload photo. Please try again.' })
    } finally {
      setIsPhotoUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.profile.title}</h1>
        <p className="text-stone-500 text-sm mt-1">{t.profile.subtitle}</p>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={fetchProfile}>
        {student && (() => {
          const fields = [
            { icon: User, label: t.profile.fullName, value: student.full_name },
            { icon: User, label: t.profile.nameForCertificate, value: student.name_for_certificate },
            { icon: User, label: t.profile.nicNumber, value: student.nic_number },
            { icon: Calendar, label: t.profile.dob, value: formatDate(student.date_of_birth) },
            { icon: User, label: t.profile.gender, value: student.gender === 'male' ? t.profile.genderMale : student.gender === 'female' ? t.profile.genderFemale : t.profile.genderOther },
            { icon: Phone, label: t.profile.phone, value: student.phone_primary },
            { icon: Mail, label: t.profile.email, value: student.email || '-' },
            { icon: MapPin, label: t.profile.address, value: [student.address_line1, student.city, student.district].filter(Boolean).join(', ') },
            { icon: MapPin, label: t.profile.province, value: student.province },
          ]

          const activePhoto = photoData?.photo_url || student.photo_url
          const photoStatus = photoData?.photo_status || (student as any).photo_status

          return (
            <div className="space-y-6">
              {/* Profile Main Card */}
              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                <div className="bg-linear-to-r from-orange-500 to-orange-600 p-6">
                  <div className="flex items-center gap-4">
                    {activePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activePhoto}
                        alt="Student photo"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/40 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">{student.full_name[0]}</span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-white">{student.full_name}</h2>
                      <p className="text-orange-100 text-sm">{student.student_number}</p>
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
                  <p className="text-xs text-stone-400">To update your personal details, please contact IITI reception: 0113 482 555</p>
                </div>
              </div>

              {/* License Photo Section */}
              <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
                <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-base">{t.profile.licensePhoto}</h3>
                      <p className="text-xs text-stone-500">{t.profile.subtitle}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {photoStatus === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.profile.photoApproved}
                      </span>
                    )}
                    {photoStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> {t.profile.photoPending}
                      </span>
                    )}
                    {photoStatus === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> {t.profile.photoRejected}
                      </span>
                    )}
                    {(!photoStatus || photoStatus === null) && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                        <AlertCircle className="w-3.5 h-3.5" /> {t.profile.uploadPhoto}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  {/* Photo Preview Box */}
                  <div className="relative shrink-0">
                    {activePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={activePhoto}
                        alt="Submitted license photo"
                        className="w-32 h-40 object-cover rounded-lg border border-stone-300 shadow-sm bg-stone-50"
                      />
                    ) : (
                      <div className="w-32 h-40 rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-center p-3 text-stone-400">
                        <Camera className="w-8 h-8 mb-2 text-stone-300" />
                        <span className="text-xs">{t.common.noData}</span>
                      </div>
                    )}
                  </div>

                  {/* Photo Details & Upload Actions */}
                  <div className="flex-1 space-y-3">
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {t.profile.photoGuidelines}
                    </p>

                    {/* Messages */}
                    {photoMessage && (
                      <div className={`p-3 rounded-lg text-xs font-medium ${photoMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {photoMessage.text}
                      </div>
                    )}

                    {/* Upload Controls */}
                    <div className="pt-2">
                      <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white font-medium text-xs hover:bg-orange-600 transition-colors cursor-pointer shadow-xs ${isPhotoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <UploadCloud className="w-4 h-4" />
                        {isPhotoUploading ? t.common.loading : activePhoto ? t.profile.changePhoto : t.profile.uploadPhoto}
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
                          className="hidden"
                          onChange={handlePhotoUpload}
                          disabled={isPhotoUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </DataLoader>
    </div>
  )
}

