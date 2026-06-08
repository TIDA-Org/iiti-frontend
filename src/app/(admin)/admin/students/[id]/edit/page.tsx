'use client'

import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { useApi } from '@/hooks/useApi'
import {
  apiGetStudent,
  apiUpdateStudent,
  apiGetGuarantors,
  apiAddGuarantors,
} from '@/lib/api/students'
import { DISTRICTS, PROVINCES } from '@/lib/constants'
import {
  isValidSriLankanNic,
  isValidSriLankanPhone,
  normalizeSriLankanPhone,
} from '@/lib/validators'

interface Props {
  params: { id: string }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

const normalizedOptionalPhone = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .refine(isValidSriLankanPhone, 'Invalid phone format')
    .transform((v) => normalizeSriLankanPhone(v)),
])

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nameForCertificate: z.string().min(2, 'Name for certificate is required'),
  nicNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine(isValidSriLankanNic, 'Invalid NIC format. Use 9 digits + V/X (old) or 12 digits (new).'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Please select a gender' }),
  phonePrimary: z
    .string()
    .trim()
    .refine(isValidSriLankanPhone, 'Invalid phone. Use 07XXXXXXXX or +947XXXXXXXX.')
    .transform((v) => normalizeSriLankanPhone(v)),
  phoneSecondary: normalizedOptionalPhone,
  email: z.union([z.literal(''), z.string().email('Invalid email format')]),
  preferredLanguage: z.enum(['en', 'si']),

  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().max(255).optional(),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),

  isDoingNvq: z.boolean().default(false),
  hasPreviousNvq: z.boolean().default(false),
  nvqEligible: z.boolean().default(false),
  tvecRefNumber: z.string().max(100).optional(),
  whatsappInGroup: z.boolean().default(false),

  emergencyContactName: z.string().max(200).optional(),
  emergencyContactPhone: normalizedOptionalPhone,
  emergencyContactRel: z.string().max(100).optional(),

  guarantor1Name: z.string().max(200).optional(),
  guarantor1Phone: normalizedOptionalPhone,
  guarantor1Rel: z.string().max(100).optional(),
  guarantor2Name: z.string().max(200).optional(),
  guarantor2Phone: normalizedOptionalPhone,
  guarantor2Rel: z.string().max(100).optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function AdminStudentEditPage({ params }: Props) {
  const { id } = params
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: student,
    isLoading: studentLoading,
    error: studentError,
    refetch: refetchStudent,
  } = useApi(() => apiGetStudent(id), [id])

  const {
    data: guarantors,
    isLoading: guarantorsLoading,
    refetch: refetchGuarantors,
  } = useApi(() => apiGetGuarantors(id), [id])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })

  // Pre-populate form once data loads
  useEffect(() => {
    if (!student) return

    const g1 = (guarantors || []).find((g) => g.guarantor_order === 1)
    const g2 = (guarantors || []).find((g) => g.guarantor_order === 2)

    reset({
      fullName: student.full_name ?? '',
      nameForCertificate: student.name_for_certificate ?? '',
      nicNumber: student.nic_number ?? '',
      dateOfBirth: student.date_of_birth?.slice(0, 10) ?? '',
      gender: (student.gender as 'male' | 'female' | 'other') ?? 'male',
      phonePrimary: student.phone_primary ?? '',
      phoneSecondary: student.phone_secondary ?? '',
      email: student.email ?? '',
      preferredLanguage: (student.preferred_language as 'en' | 'si') ?? 'si',
      addressLine1: student.address_line1 ?? '',
      addressLine2: student.address_line2 ?? '',
      city: student.city ?? '',
      district: student.district ?? '',
      province: student.province ?? '',
      isDoingNvq: student.is_doing_nvq ?? false,
      hasPreviousNvq: student.has_previous_nvq ?? false,
      nvqEligible: student.nvq_eligible ?? false,
      tvecRefNumber: student.tvec_ref_number ?? '',
      whatsappInGroup: student.whatsapp_in_group ?? false,
      emergencyContactName: student.emergency_contact_name ?? '',
      emergencyContactPhone: student.emergency_contact_phone ?? '',
      emergencyContactRel: student.emergency_contact_rel ?? '',
      guarantor1Name: g1?.full_name ?? '',
      guarantor1Phone: g1?.phone ?? '',
      guarantor1Rel: g1?.relationship_to ?? '',
      guarantor2Name: g2?.full_name ?? '',
      guarantor2Phone: g2?.phone ?? '',
      guarantor2Rel: g2?.relationship_to ?? '',
    })
  }, [student, guarantors, reset])

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    setIsSubmitting(true)
    try {
      // 1. Update student record
      await apiUpdateStudent(id, {
        full_name: data.fullName,
        name_for_certificate: data.nameForCertificate,
        nic_number: data.nicNumber,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        phone_primary: data.phonePrimary,
        phone_secondary: data.phoneSecondary || null,
        email: data.email || null,
        preferred_language: data.preferredLanguage,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2?.trim() || null,
        city: data.city,
        district: data.district,
        province: data.province,
        is_doing_nvq: data.isDoingNvq,
        has_previous_nvq: data.hasPreviousNvq,
        nvq_eligible: data.nvqEligible,
        tvec_ref_number: data.tvecRefNumber?.trim() || null,
        whatsapp_in_group: data.whatsappInGroup,
        emergency_contact_name: data.emergencyContactName?.trim() || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        emergency_contact_rel: data.emergencyContactRel?.trim() || null,
      })

      // 2. Update guarantors if at least one has a name
      const updatedGuarantors: Array<{
        guarantor_order: number
        full_name: string
        phone?: string | null
        relationship_to?: string | null
      }> = []
      if (data.guarantor1Name?.trim()) {
        updatedGuarantors.push({
          guarantor_order: 1,
          full_name: data.guarantor1Name.trim(),
          phone: data.guarantor1Phone || null,
          relationship_to: data.guarantor1Rel?.trim() || null,
        })
      }
      if (data.guarantor2Name?.trim()) {
        updatedGuarantors.push({
          guarantor_order: 2,
          full_name: data.guarantor2Name.trim(),
          phone: data.guarantor2Phone || null,
          relationship_to: data.guarantor2Rel?.trim() || null,
        })
      }
      if (updatedGuarantors.length > 0) {
        await apiAddGuarantors(id, updatedGuarantors)
      }

      toast.success('Student record updated successfully.')
      router.push(`/admin/students/${id}`)
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Failed to update student record.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-slate-50 disabled:text-slate-400'
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

  const studentDisplayName =
    student?.full_name?.trim() || student?.name_for_certificate?.trim() || 'Student'

  return (
    <DataLoader
      isLoading={studentLoading || guarantorsLoading}
      error={studentError}
      onRetry={() => { refetchStudent(); refetchGuarantors() }}
    >
      {student && (
        <div className="w-full">
          <PageHeader
            title={`Edit ${studentDisplayName}`}
            subtitle={student.student_number}
            actions={
              <Link
                href={`/admin/students/${id}`}
                className="flex items-center gap-2 border border-slate-200 text-slate-600 hover:border-slate-300 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Profile
              </Link>
            }
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Personal Information ── */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-5">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input {...register('fullName')} className={inputClass} />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Name for Certificate *</label>
                  <input {...register('nameForCertificate')} className={inputClass} />
                  {errors.nameForCertificate && (
                    <p className="text-red-500 text-xs mt-1">{errors.nameForCertificate.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>NIC Number *</label>
                  <input
                    {...register('nicNumber')}
                    className={inputClass}
                    placeholder="200012345V or 200012345678"
                  />
                  {errors.nicNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.nicNumber.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input {...register('dateOfBirth')} type="date" className={inputClass} />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Gender *</label>
                  <select {...register('gender')} className={inputClass}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Preferred Language *</label>
                  <select {...register('preferredLanguage')} className={inputClass}>
                    <option value="si">Sinhala</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Primary Phone *</label>
                  <input
                    {...register('phonePrimary')}
                    className={inputClass}
                    placeholder="0771234567 or +94771234567"
                  />
                  {errors.phonePrimary && (
                    <p className="text-red-500 text-xs mt-1">{errors.phonePrimary.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Secondary Phone</label>
                  <input
                    {...register('phoneSecondary')}
                    className={inputClass}
                    placeholder="0771234567 or +94771234567"
                  />
                  {errors.phoneSecondary && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneSecondary.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Email</label>
                <input {...register('email')} type="email" className={inputClass} />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
            </section>

            {/* ── Address ── */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-5">Address</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Address Line 1 *</label>
                  <input {...register('addressLine1')} className={inputClass} />
                  {errors.addressLine1 && (
                    <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Address Line 2</label>
                  <input {...register('addressLine2')} className={inputClass} />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>City *</label>
                    <input {...register('city')} className={inputClass} />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>District *</label>
                    <select {...register('district')} className={inputClass}>
                      <option value="">Select</option>
                      {DISTRICTS.map((d) => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {errors.district && (
                      <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Province *</label>
                    <select {...register('province')} className={inputClass}>
                      <option value="">Select</option>
                      {PROVINCES.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    {errors.province && (
                      <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* ── NVQ & Flags ── */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-5">NVQ & Flags</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register('isDoingNvq')}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  Student is doing NVQ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register('hasPreviousNvq')}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  Has previous NVQ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register('nvqEligible')}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  NVQ eligible
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    {...register('whatsappInGroup')}
                    className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  In WhatsApp group
                </label>
              </div>
              <div className="mt-4">
                <label className={labelClass}>TVEC Reference Number</label>
                <input {...register('tvecRefNumber')} className={inputClass} placeholder="e.g. TVEC-2024-XXXXX" />
              </div>
            </section>

            {/* ── Emergency Contact ── */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-5">Emergency Contact</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Contact Name</label>
                  <input {...register('emergencyContactName')} className={inputClass} />
                  {errors.emergencyContactName && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Contact Phone</label>
                  <input
                    {...register('emergencyContactPhone')}
                    className={inputClass}
                    placeholder="0771234567 or +94771234567"
                  />
                  {errors.emergencyContactPhone && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Relationship</label>
                  <input {...register('emergencyContactRel')} className={inputClass} placeholder="e.g. Mother, Brother" />
                  {errors.emergencyContactRel && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRel.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* ── Guarantors ── */}
            <section className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-5">Guarantors</h3>
              <div className="space-y-5">
                {/* Guarantor 1 */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Guarantor 1
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input {...register('guarantor1Name')} className={inputClass} />
                      {errors.guarantor1Name && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor1Name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        {...register('guarantor1Phone')}
                        className={inputClass}
                        placeholder="0771234567 or +94771234567"
                      />
                      {errors.guarantor1Phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor1Phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <input {...register('guarantor1Rel')} className={inputClass} />
                      {errors.guarantor1Rel && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor1Rel.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    Guarantor 2
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input {...register('guarantor2Name')} className={inputClass} />
                      {errors.guarantor2Name && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor2Name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        {...register('guarantor2Phone')}
                        className={inputClass}
                        placeholder="0771234567 or +94771234567"
                      />
                      {errors.guarantor2Phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor2Phone.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass}>Relationship</label>
                      <input {...register('guarantor2Rel')} className={inputClass} />
                      {errors.guarantor2Rel && (
                        <p className="text-red-500 text-xs mt-1">{errors.guarantor2Rel.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Submit ── */}
            <div className="flex items-center justify-between pb-8">
              <Link
                href={`/admin/students/${id}`}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:border-slate-300 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </DataLoader>
  )
}
