'use client'

import { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  BatchApiResponse,
  CourseApiResponse,
  apiGetBatches,
  apiGetCourses,
} from '@/lib/api/courses'
import { apiCreateEnrollment, apiUpdateEnrollmentStatus } from '@/lib/api/enrollments'
import { apiCreateManualPayment } from '@/lib/api/payments'
import { apiCreateStudent } from '@/lib/api/students'
import { useApi } from '@/hooks/useApi'
import { DISTRICTS, PROVINCES } from '@/lib/constants'
import {
  extractSriLankanNicDetails,
  isValidSriLankanNic,
  isValidSriLankanPhone,
  normalizeSriLankanPhone,
} from '@/lib/validators'
import { ArrowLeft, ArrowRight, CheckCircle, Pencil } from 'lucide-react'

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

function formatCurrency(amount: number, currency = 'LKR') {
  return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  nameWithInitials: z.string().min(2, 'Name for certificate is required'),
  nic: z
    .string()
    .trim()
    .toUpperCase()
    .refine(
      isValidSriLankanNic,
      'Invalid NIC format. Use 9 digits + V/X (old) or 12 digits (new).',
    ),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Please select a gender' }),
  phone: z
    .string()
    .trim()
    .refine(isValidSriLankanPhone, 'Invalid phone. Use 07XXXXXXXX or +947XXXXXXXX.')
    .transform((v) => normalizeSriLankanPhone(v)),
  phoneSecondary: normalizedOptionalPhone,
  email: z.union([z.literal(''), z.string().email('Invalid email format')]),
  preferredLanguage: z.enum(['en', 'si']),

  addressLine1: z.string().min(5, 'Address is required'),
  addressLine2: z.string().max(255, 'Address line 2 is too long').optional(),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),

  isDoingNvq: z.boolean().default(false),
  hasPreviousNvq: z.boolean().default(false),

  emergencyContactName: z.string().max(200, 'Emergency contact name is too long').optional(),
  emergencyContactPhone: normalizedOptionalPhone,
  emergencyContactRel: z.string().max(100, 'Relationship is too long').optional(),

  guarantor1Name: z.string().max(200, 'Guarantor name is too long').optional(),
  guarantor1Phone: normalizedOptionalPhone,
  guarantor1Rel: z.string().max(100, 'Relationship is too long').optional(),
  guarantor2Name: z.string().max(200, 'Guarantor name is too long').optional(),
  guarantor2Phone: normalizedOptionalPhone,
  guarantor2Rel: z.string().max(100, 'Relationship is too long').optional(),

  // Enrollment fields
  courseId: z.string().min(1, 'Please select a course'),
  batchId: z.string().optional(),
  durationOptionId: z.string().optional(),
  paymentPlan: z.enum(['full', 'installment'], { message: 'Please select a payment plan' }),
  nvqSelected: z.boolean().default(false),
  // initialPayment: advance payment recorded at registration (installment only)
  customFee: z.union([
    z.literal(''),
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount — use digits only (e.g. 5000 or 5000.00)'),
  ]),
  enrollmentNotes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

export default function AdminNewStudentPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [batches, setBatches] = useState<BatchApiResponse[]>([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(false)
  const router = useRouter()

  const { data: courses } = useApi<CourseApiResponse[]>(
    () => apiGetCourses(),
    [],
  )

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      paymentPlan: 'full',
      nvqSelected: false,
      customFee: '',
      batchId: '',
      durationOptionId: '',
      enrollmentNotes: '',
      email: '',
      phoneSecondary: '',
      preferredLanguage: 'si',
      isDoingNvq: false,
      hasPreviousNvq: false,
      emergencyContactPhone: '',
      guarantor1Phone: '',
      guarantor2Phone: '',
    },
  })

  const formValues = watch()
  const nicValue = formValues.nic
  const courseIdValue = formValues.courseId
  const paymentPlanValue = formValues.paymentPlan
  const batchIdValue = formValues.batchId
  const durationOptionIdValue = formValues.durationOptionId
  const selectedCourse = courses?.find((course) => course.id === courseIdValue)
  const selectedBatch = batches.find((b) => b.id === batchIdValue)
  const selectedDurationOption = selectedCourse?.duration_options?.find(
    (opt) => opt.id === Number(durationOptionIdValue)
  )
  const lastProcessedNicRef = useRef<string>('')

  useEffect(() => {
    const trimmedNic = nicValue?.trim().toUpperCase() || ''
    if (!trimmedNic || !isValidSriLankanNic(trimmedNic)) {
      return
    }

    // Only update dateOfBirth and gender when a new valid NIC is entered
    if (trimmedNic !== lastProcessedNicRef.current) {
      lastProcessedNicRef.current = trimmedNic
      const details = extractSriLankanNicDetails(trimmedNic)
      setValue('dateOfBirth', details.dateOfBirth, { shouldValidate: true })
      setValue('gender', details.gender, { shouldValidate: true })
    }
  }, [nicValue, setValue])

  // Clear advance payment amount whenever user switches back to Full Payment
  useEffect(() => {
    if (paymentPlanValue === 'full') {
      setValue('customFee', '', { shouldValidate: false })
    }
  }, [paymentPlanValue, setValue])

  useEffect(() => {
    if (!courseIdValue) {
      setBatches([])
      setValue('batchId', '', { shouldValidate: true })
      setValue('durationOptionId', '', { shouldValidate: true })
      return
    }

    const loadBatches = async () => {
      setIsLoadingBatches(true)
      try {
        const data = await apiGetBatches(courseIdValue)
        setBatches(data)
      } catch {
        setBatches([])
      } finally {
        setIsLoadingBatches(false)
      }
    }

    loadBatches()
  }, [courseIdValue, setValue])

  const inputClass = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white'
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide'

  const nextStep = async () => {
    const fields = step === 1
      ? [
        'fullName', 'nameWithInitials', 'nic', 'dateOfBirth', 'gender', 'phone', 'phoneSecondary', 'email',
        'preferredLanguage', 'isDoingNvq', 'hasPreviousNvq', 'emergencyContactPhone',
      ] as const
      : [
        'addressLine1', 'city', 'district', 'province', 'courseId', 'paymentPlan', 'customFee',
        'guarantor1Phone', 'guarantor2Phone',
      ] as const
    const ok = await trigger(fields)
    if (ok) setStep((s) => s + 1)
  }

  const onSubmit: SubmitHandler<FormOutput> = async (data) => {
    if (step !== 3) {
      return
    }
    setIsLoading(true)
    try {
      const guarantors: Array<{ guarantor_order: number; full_name: string; phone?: string | null; relationship_to?: string | null }> = []
      if (data.guarantor1Name?.trim()) {
        guarantors.push({
          guarantor_order: 1,
          full_name: data.guarantor1Name.trim(),
          phone: data.guarantor1Phone || null,
          relationship_to: data.guarantor1Rel?.trim() || null,
        })
      }
      if (data.guarantor2Name?.trim()) {
        guarantors.push({
          guarantor_order: 2,
          full_name: data.guarantor2Name.trim(),
          phone: data.guarantor2Phone || null,
          relationship_to: data.guarantor2Rel?.trim() || null,
        })
      }

      const student = await apiCreateStudent({
        full_name: data.fullName,
        name_for_certificate: data.nameWithInitials,
        nic_number: data.nic,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        phone_primary: data.phone,
        phone_secondary: data.phoneSecondary || null,
        email: data.email || null,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2?.trim() || null,
        city: data.city,
        district: data.district,
        province: data.province,
        preferred_language: data.preferredLanguage,
        is_doing_nvq: data.isDoingNvq,
        has_previous_nvq: data.hasPreviousNvq,
        emergency_contact_name: data.emergencyContactName?.trim() || null,
        emergency_contact_phone: data.emergencyContactPhone || null,
        emergency_contact_rel: data.emergencyContactRel?.trim() || null,
        guarantors: guarantors.length > 0 ? guarantors : null,
      })

      try {
        const enrollment = await apiCreateEnrollment({
          student_id: student.id,
          course_id: data.courseId,
          batch_id: data.batchId || null,
          duration_option_id: data.durationOptionId ? Number(data.durationOptionId) : null,
          payment_plan: data.paymentPlan,
          nvq_selected: data.nvqSelected,
          // custom_fee intentionally omitted — course's standard fee is always used
          notes: data.enrollmentNotes || null,
        })

        // Record advance payment if provided (installment plan only)
        const advanceAmount = data.customFee ? Number(data.customFee) : 0
        if (data.paymentPlan === 'installment' && advanceAmount > 0) {
          try {
            await apiCreateManualPayment({
              enrollment_id: enrollment.id,
              amount: advanceAmount,
              manual_reason: 'Initial advance payment at registration',
              is_advance: true,
            })
            await apiUpdateEnrollmentStatus(enrollment.id, 'active')
            toast.success('Student enrolled and initial payment recorded!')
          } catch (paymentError: unknown) {
            toast.warning(
              getErrorMessage(paymentError, 'Enrolled successfully, but failed to record the initial payment. Please add it manually.')
            )
          }
        } else {
          toast.success('Student and enrollment created successfully!')
        }
      } catch (enrollmentError: unknown) {
        toast.warning(getErrorMessage(enrollmentError, 'Student created, but enrollment creation failed.'))
      }

      router.push('/admin/students')
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, 'Registration failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Register New Student" subtitle="On-site student registration" />

      <div className="flex items-center gap-2 mb-8">
        {['Personal Info', 'Address & Enrollment', 'Review'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-amber-600' : 'text-slate-400'}`}>{label}</span>
            {i < 2 && <div className={`w-12 h-px ${step > i + 1 ? 'bg-green-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && step < 3 && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
            e.preventDefault()
            nextStep()
          }
        }}
      >
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 mb-4">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Full Name *</label><input {...register('fullName')} className={inputClass} />{errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}</div>
                <div><label className={labelClass}>Name for Certificate *</label><input {...register('nameWithInitials')} className={inputClass} />{errors.nameWithInitials && <p className="text-red-500 text-xs mt-1">{errors.nameWithInitials.message}</p>}</div>
                <div><label className={labelClass}>NIC Number *</label><input {...register('nic')} className={inputClass} placeholder="200012345V or 200012345678" />{errors.nic && <p className="text-red-500 text-xs mt-1">{errors.nic.message}</p>}</div>
                <div>
                  <label className={labelClass}>Date of Birth *</label>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className={`${inputClass} cursor-pointer`}
                    onClick={(e) => {
                      try {
                        e.currentTarget.showPicker?.()
                      } catch {}
                    }}
                  />
                  <p className="text-slate-400 text-xs mt-1">Auto-calculated from NIC — you can change it if needed.</p>
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                </div>
                <div><label className={labelClass}>Gender *</label><select {...register('gender')} className={inputClass}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select>{errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}</div>
                <div><label className={labelClass}>Primary Phone *</label><input {...register('phone')} className={inputClass} placeholder="0771234567 or +94771234567" />{errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}</div>
                <div><label className={labelClass}>Secondary Phone</label><input {...register('phoneSecondary')} className={inputClass} placeholder="0771234567 or +94771234567" />{errors.phoneSecondary && <p className="text-red-500 text-xs mt-1">{errors.phoneSecondary.message}</p>}</div>
                <div>
                  <label className={labelClass}>Preferred Language *</label>
                  <select {...register('preferredLanguage')} className={inputClass}>
                    <option value="si">Sinhala</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
              <div><label className={labelClass}>Email (Optional)</label><input {...register('email')} type="email" className={inputClass} />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Emergency Contact Name</label><input {...register('emergencyContactName')} className={inputClass} />{errors.emergencyContactName && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactName.message}</p>}</div>
                <div><label className={labelClass}>Emergency Contact Phone</label><input {...register('emergencyContactPhone')} className={inputClass} placeholder="0771234567 or +94771234567" />{errors.emergencyContactPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactPhone.message}</p>}</div>
              </div>
              <div><label className={labelClass}>Emergency Contact Relationship</label><input {...register('emergencyContactRel')} className={inputClass} />{errors.emergencyContactRel && <p className="text-red-500 text-xs mt-1">{errors.emergencyContactRel.message}</p>}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" {...register('isDoingNvq')} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  Student is doing NVQ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" {...register('hasPreviousNvq')} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  Student has previous NVQ
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 mb-4">Address, Guarantors & Enrollment</h3>
              <div><label className={labelClass}>Address Line 1 *</label><input {...register('addressLine1')} className={inputClass} />{errors.addressLine1 && <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>}</div>
              <div><label className={labelClass}>Address Line 2</label><input {...register('addressLine2')} className={inputClass} />{errors.addressLine2 && <p className="text-red-500 text-xs mt-1">{errors.addressLine2.message}</p>}</div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className={labelClass}>City *</label><input {...register('city')} className={inputClass} />{errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}</div>
                <div><label className={labelClass}>District *</label><select {...register('district')} className={inputClass}><option value="">Select</option>{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select>{errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}</div>
                <div><label className={labelClass}>Province *</label><select {...register('province')} className={inputClass}><option value="">Select</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select>{errors.province && <p className="text-red-500 text-xs mt-1">{errors.province.message}</p>}</div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Guarantors (Optional)</h4>
                <div className="grid sm:grid-cols-3 gap-3 mb-3">
                  <div><label className={labelClass}>Guarantor 1 Name</label><input {...register('guarantor1Name')} className={inputClass} />{errors.guarantor1Name && <p className="text-red-500 text-xs mt-1">{errors.guarantor1Name.message}</p>}</div>
                  <div><label className={labelClass}>Guarantor 1 Phone</label><input {...register('guarantor1Phone')} className={inputClass} placeholder="0771234567 or +94771234567" />{errors.guarantor1Phone && <p className="text-red-500 text-xs mt-1">{errors.guarantor1Phone.message}</p>}</div>
                  <div><label className={labelClass}>Guarantor 1 Relationship</label><input {...register('guarantor1Rel')} className={inputClass} />{errors.guarantor1Rel && <p className="text-red-500 text-xs mt-1">{errors.guarantor1Rel.message}</p>}</div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div><label className={labelClass}>Guarantor 2 Name</label><input {...register('guarantor2Name')} className={inputClass} />{errors.guarantor2Name && <p className="text-red-500 text-xs mt-1">{errors.guarantor2Name.message}</p>}</div>
                  <div><label className={labelClass}>Guarantor 2 Phone</label><input {...register('guarantor2Phone')} className={inputClass} placeholder="0771234567 or +94771234567" />{errors.guarantor2Phone && <p className="text-red-500 text-xs mt-1">{errors.guarantor2Phone.message}</p>}</div>
                  <div><label className={labelClass}>Guarantor 2 Relationship</label><input {...register('guarantor2Rel')} className={inputClass} />{errors.guarantor2Rel && <p className="text-red-500 text-xs mt-1">{errors.guarantor2Rel.message}</p>}</div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Enrollment</h4>
                <div>
                  <label className={labelClass}>Course *</label>
                  <select {...register('courseId')} className={inputClass}>
                    <option value="">Select a course</option>
                    {(courses || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>}
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className={labelClass}>Batch (Optional)</label>
                    <select {...register('batchId')} className={inputClass} disabled={!courseIdValue || isLoadingBatches}>
                      <option value="">{isLoadingBatches ? 'Loading batches...' : 'Select batch'}</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.batch_code} ({b.start_date} to {b.end_date})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Duration Option (Optional)</label>
                    <select {...register('durationOptionId')} className={inputClass} disabled={!courseIdValue}>
                      <option value="">Select duration option</option>
                      {(selectedCourse?.duration_options || []).map(opt => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label || `${opt.duration_value} ${opt.duration_unit}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className={labelClass}>Payment Plan *</label>
                    <select {...register('paymentPlan')} className={inputClass}>
                      <option value="full">Full Payment</option>
                      <option value="installment">Installment</option>
                    </select>
                    {errors.paymentPlan && <p className="text-red-500 text-xs mt-1">{errors.paymentPlan.message}</p>}
                  </div>
                  {paymentPlanValue === 'installment' && (
                    <div>
                      <label className={labelClass}>Initial Advance Payment (Optional)</label>
                      <input
                        {...register('customFee')}
                        className={inputClass}
                        placeholder="e.g. 5000"
                        inputMode="numeric"
                      />
                      <p className="text-slate-400 text-xs mt-1">Amount collected at registration as first installment.</p>
                      {errors.customFee && <p className="text-red-500 text-xs mt-1">{errors.customFee.message}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input id="nvqSelected" type="checkbox" {...register('nvqSelected')} className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                  <label htmlFor="nvqSelected" className="text-sm text-slate-700">NVQ selected for this enrollment</label>
                </div>

                <div className="mt-3">
                  <label className={labelClass}>Enrollment Notes (Optional)</label>
                  <textarea {...register('enrollmentNotes')} rows={2} className={inputClass} />
                  {errors.enrollmentNotes && <p className="text-red-500 text-xs mt-1">{errors.enrollmentNotes.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-800">Review Student & Enrollment Details</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Please review all entered details before finalizing registration. Click Edit on any section to make changes.
                </p>
              </div>

              {/* Personal Information Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Personal Information</h4>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Full Name</span>
                    <span className="font-medium text-slate-800">{formValues.fullName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Name for Certificate</span>
                    <span className="font-medium text-slate-800">{formValues.nameWithInitials || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">NIC Number</span>
                    <span className="font-medium text-slate-800 font-mono">{formValues.nic || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Date of Birth</span>
                    <span className="font-medium text-slate-800">{formValues.dateOfBirth || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Gender</span>
                    <span className="font-medium text-slate-800 capitalize">{formValues.gender || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Primary Phone</span>
                    <span className="font-medium text-slate-800 font-mono">{formValues.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Secondary Phone</span>
                    <span className="font-medium text-slate-800 font-mono">{formValues.phoneSecondary || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email</span>
                    <span className="font-medium text-slate-800">{formValues.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Preferred Language</span>
                    <span className="font-medium text-slate-800">
                      {formValues.preferredLanguage === 'si' ? 'Sinhala (si)' : 'English (en)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">NVQ Background</span>
                    <span className="font-medium text-slate-800">
                      {[
                        formValues.isDoingNvq ? 'Currently doing NVQ' : null,
                        formValues.hasPreviousNvq ? 'Has previous NVQ' : null,
                      ].filter(Boolean).join(', ') || 'None'}
                    </span>
                  </div>
                  {(formValues.emergencyContactName || formValues.emergencyContactPhone || formValues.emergencyContactRel) && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-400 block">Emergency Contact</span>
                      <span className="font-medium text-slate-800">
                        {formValues.emergencyContactName || '—'}
                        {formValues.emergencyContactRel ? ` (${formValues.emergencyContactRel})` : ''}
                        {formValues.emergencyContactPhone ? ` • ${formValues.emergencyContactPhone}` : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Address & Guarantors Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Address & Guarantors</h4>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-400 block">Address</span>
                    <span className="font-medium text-slate-800">
                      {[formValues.addressLine1, formValues.addressLine2, formValues.city, formValues.district, formValues.province]
                        .filter(Boolean)
                        .join(', ') || '—'}
                    </span>
                  </div>
                  {formValues.guarantor1Name && (
                    <div>
                      <span className="text-xs text-slate-400 block">Guarantor 1</span>
                      <span className="font-medium text-slate-800">
                        {formValues.guarantor1Name}
                        {formValues.guarantor1Rel ? ` (${formValues.guarantor1Rel})` : ''}
                        {formValues.guarantor1Phone ? ` • ${formValues.guarantor1Phone}` : ''}
                      </span>
                    </div>
                  )}
                  {formValues.guarantor2Name && (
                    <div>
                      <span className="text-xs text-slate-400 block">Guarantor 2</span>
                      <span className="font-medium text-slate-800">
                        {formValues.guarantor2Name}
                        {formValues.guarantor2Rel ? ` (${formValues.guarantor2Rel})` : ''}
                        {formValues.guarantor2Phone ? ` • ${formValues.guarantor2Phone}` : ''}
                      </span>
                    </div>
                  )}
                  {!formValues.guarantor1Name && !formValues.guarantor2Name && (
                    <div className="sm:col-span-2">
                      <span className="text-xs text-slate-400 block">Guarantors</span>
                      <span className="text-slate-400 italic">None provided</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Course & Enrollment Details Card */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Course & Enrollment Details</h4>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Course</span>
                    <span className="font-medium text-slate-800">
                      {selectedCourse ? selectedCourse.name : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Batch</span>
                    <span className="font-medium text-slate-800">
                      {selectedBatch
                        ? `${selectedBatch.batch_code} (${selectedBatch.start_date} to ${selectedBatch.end_date})`
                        : 'None / Not Assigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Duration Option</span>
                    <span className="font-medium text-slate-800">
                      {selectedDurationOption
                        ? selectedDurationOption.label || `${selectedDurationOption.duration_value} ${selectedDurationOption.duration_unit}`
                        : 'Standard Course Duration'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Payment Plan</span>
                    <span className="font-medium text-slate-800 capitalize">
                      {formValues.paymentPlan === 'installment' ? 'Installment Plan' : 'Full Payment'}
                    </span>
                  </div>
                  {formValues.paymentPlan === 'installment' && (
                    <div>
                      <span className="text-xs text-slate-400 block">Initial Advance Payment</span>
                      <span className="font-semibold text-amber-600">
                        {formValues.customFee && Number(formValues.customFee) > 0
                          ? formatCurrency(Number(formValues.customFee))
                          : 'None (No advance deposit at registration)'}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 block">NVQ Selection</span>
                    <span className="font-medium text-slate-800">
                      {formValues.nvqSelected ? 'Yes — NVQ selected for this enrollment' : 'No'}
                    </span>
                  </div>
                  {formValues.enrollmentNotes && (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-400 block">Enrollment Notes</span>
                      <span className="font-medium text-slate-800 whitespace-pre-wrap">{formValues.enrollmentNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <button
              key="btn-back"
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:border-slate-300"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 3 ? (
            <button
              key="btn-continue"
              type="button"
              onClick={nextStep}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              key="btn-register"
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors"
            >
              {isLoading ? 'Registering...' : 'Register Student'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
