'use client'

import { useEffect, useState } from 'react'
import { apiGetMyProfile, StudentApiResponse } from '@/lib/api'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react'

export default function PortalProfilePage() {
  const [student, setStudent] = useState<StudentApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{student.full_name[0]}</span>
                  </div>
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
                      <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
