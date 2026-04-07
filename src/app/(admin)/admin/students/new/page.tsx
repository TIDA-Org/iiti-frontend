'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiCreateStudent } from '@/lib/api'
import { DISTRICTS, PROVINCES } from '@/lib/constants'
import { COURSES } from '@/lib/data/courses'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const schema = z.object({
  fullName: z.string().min(2),
  nameWithInitials: z.string().min(2),
  nic: z.string().min(9),
  dateOfBirth: z.string().min(1),
  gender: z.enum(['male', 'female']),
  phone: z.string().min(9),
  email: z.string().email(),
  addressLine1: z.string().min(5),
  city: z.string().min(2),
  district: z.string().min(1),
  province: z.string().min(1),
  courseId: z.string().min(1, 'Please select a course'),
  paymentPlan: z.enum(['full', 'installment']),
})

type FormData = z.infer<typeof schema>

export default function AdminNewStudentPage() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide"

  const nextStep = async () => {
    const fields = step === 1
      ? ['fullName', 'nameWithInitials', 'nic', 'dateOfBirth', 'gender', 'phone', 'email'] as const
      : ['addressLine1', 'city', 'district', 'province'] as const
    const ok = await trigger(fields)
    if (ok) setStep(s => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      await apiCreateStudent({
        full_name: data.fullName,
        name_with_initials: data.nameWithInitials,
        nic_number: data.nic,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        phone_primary: data.phone,
        email: data.email,
        address_line1: data.addressLine1,
        city: data.city,
        district: data.district,
        province: data.province,
      })
      toast.success('Student registered successfully!')
      router.push('/admin/students')
    } catch (err: any) {
      toast.error(err?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Register New Student" subtitle="On-site student registration" />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Personal Info', 'Address & Course', 'Review'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {step > i + 1 ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${step === i + 1 ? 'text-amber-600' : 'text-slate-400'}`}>{label}</span>
            {i < 2 && <div className={`w-12 h-px ${step > i + 1 ? 'bg-green-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 mb-4">Personal Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Full Name *</label><input {...register('fullName')} className={inputClass} />{errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}</div>
                <div><label className={labelClass}>Name with Initials *</label><input {...register('nameWithInitials')} className={inputClass} /></div>
                <div><label className={labelClass}>NIC Number *</label><input {...register('nic')} className={inputClass} /></div>
                <div><label className={labelClass}>Date of Birth *</label><input {...register('dateOfBirth')} type="date" className={inputClass} /></div>
                <div><label className={labelClass}>Gender *</label><select {...register('gender')} className={inputClass}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className={labelClass}>Phone *</label><input {...register('phone')} className={inputClass} /></div>
              </div>
              <div><label className={labelClass}>Email *</label><input {...register('email')} type="email" className={inputClass} />{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}</div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700 mb-4">Address & Course</h3>
              <div><label className={labelClass}>Address *</label><input {...register('addressLine1')} className={inputClass} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className={labelClass}>City *</label><input {...register('city')} className={inputClass} /></div>
                <div><label className={labelClass}>District *</label><select {...register('district')} className={inputClass}><option value="">Select</option>{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select></div>
                <div><label className={labelClass}>Province *</label><select {...register('province')} className={inputClass}><option value="">Select</option>{PROVINCES.map(p => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div><label className={labelClass}>Course *</label><select {...register('courseId')} className={inputClass}><option value="">Select a course</option>{COURSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>}</div>
              <div><label className={labelClass}>Payment Plan *</label><select {...register('paymentPlan')} className={inputClass}><option value="full">Full Payment</option><option value="installment">Installment</option></select></div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold text-slate-700 mb-4">Review Details</h3>
              <div className="bg-amber-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-amber-800 font-medium">Please verify all information before registering the student.</p>
              </div>
              <p className="text-sm text-slate-500">All details from steps 1 and 2 will be saved. Click Register to complete.</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          {step > 1 && (
            <button type="button" onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 border border-slate-200 text-slate-600 px-5 py-2.5 rounded-lg font-semibold text-sm hover:border-slate-300">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
              {isLoading ? 'Registering...' : 'Register Student'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
