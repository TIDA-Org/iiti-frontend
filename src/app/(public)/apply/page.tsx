'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { delay, generateId } from '@/lib/utils'
import { DISTRICTS, PROVINCES } from '@/lib/constants'
import { SectionLabel } from '@/components/shared/SectionLabel'

const COURSES = [
  { id: 'c1', name: 'Forklift Operator Training Programme', fee: 35000 },
  { id: 'c2', name: 'Excavator Operator Training Programme', fee: 45000 },
  { id: 'c3', name: 'Backhoe Loader Operator Training Programme', fee: 40000 },
]

const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nameWithInitials: z.string().min(2, 'Name with initials is required'),
  nic: z.string().min(9, 'Valid NIC is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  phone: z.string().min(9, 'Phone number is required'),
  email: z.string().email('Valid email required'),
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().min(1, 'District is required'),
  province: z.string().min(1, 'Province is required'),
})

const step2Schema = z.object({
  courses: z.array(z.string()).min(1, 'Please select at least one course'),
  paymentMethod: z.enum(['full', 'installment']),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export default function ApplyPage() {
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refNo] = useState(`APP-2025-${Math.floor(Math.random() * 9000) + 1000}`)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { courses: [], paymentMethod: 'full' } })

  const onStep1 = (data: Step1Data) => { setStep1Data(data); setStep(2) }
  const onStep2 = (data: Step2Data) => { setStep2Data(data); setStep(3) }

  const onSubmit = async () => {
    setIsLoading(true)
    await delay(1000)
    setIsLoading(false)
    setSubmitted(true)
  }

  const inputClass = "w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const labelClass = "block text-sm font-medium text-stone-700 mb-1.5"

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center max-w-lg w-full shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Application Submitted!</h2>
          <p className="text-stone-500 mb-4">Your application reference: <span className="font-mono font-bold text-orange-600">{refNo}</span></p>
          <p className="text-stone-400 text-sm mb-8">We will contact you within 2 business days.</p>
          <div className="bg-stone-50 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
            <p className="font-semibold text-stone-700 mb-3">What happens next?</p>
            {['Admin review of your application', 'Payment confirmation', 'Enrollment activation + Student ID issued', 'Portal access credentials sent to your email'].map((s, i) => (
              <div key={i} className="flex gap-2.5"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span><span className="text-stone-600">{s}</span></div>
            ))}
          </div>
          <a href="/" className="inline-block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors">Back to Home</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel className="justify-center">Online Application</SectionLabel>
          <h1 className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Apply for a Course</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {['Personal Info', 'Course & Payment', 'Review & Submit'].map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1.5 font-medium ${step === i + 1 ? 'text-orange-500' : 'text-stone-400'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`w-16 h-0.5 mx-2 mb-5 ${step > i + 1 ? 'bg-green-400' : 'bg-stone-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
              <h2 className="text-lg font-bold text-stone-800 mb-5">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={labelClass}>Full Name *</label><input {...form1.register('fullName')} className={inputClass} />{form1.formState.errors.fullName && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.fullName.message}</p>}</div>
                <div><label className={labelClass}>Name with Initials *</label><input {...form1.register('nameWithInitials')} className={inputClass} />{form1.formState.errors.nameWithInitials && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.nameWithInitials.message}</p>}</div>
                <div><label className={labelClass}>NIC Number *</label><input {...form1.register('nic')} className={inputClass} />{form1.formState.errors.nic && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.nic.message}</p>}</div>
                <div><label className={labelClass}>Date of Birth *</label><input {...form1.register('dateOfBirth')} type="date" className={inputClass} />{form1.formState.errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.dateOfBirth.message}</p>}</div>
                <div><label className={labelClass}>Gender *</label><select {...form1.register('gender')} className={inputClass + ' bg-white'}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                <div><label className={labelClass}>Phone *</label><input {...form1.register('phone')} className={inputClass} />{form1.formState.errors.phone && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.phone.message}</p>}</div>
              </div>
              <div><label className={labelClass}>Email *</label><input {...form1.register('email')} type="email" className={inputClass} />{form1.formState.errors.email && <p className="text-red-500 text-xs mt-1">{form1.formState.errors.email.message}</p>}</div>
              <div><label className={labelClass}>Address Line 1 *</label><input {...form1.register('addressLine1')} className={inputClass} /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div><label className={labelClass}>City *</label><input {...form1.register('city')} className={inputClass} /></div>
                <div><label className={labelClass}>District *</label><select {...form1.register('district')} className={inputClass + ' bg-white'}><option value="">Select</option>{DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label className={labelClass}>Province *</label><select {...form1.register('province')} className={inputClass + ' bg-white'}><option value="">Select</option>{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors mt-4">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-6">
              <h2 className="text-lg font-bold text-stone-800 mb-5">Course Selection & Payment</h2>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Select Programme(s) *</label>
                <div className="space-y-2">
                  {COURSES.map(c => (
                    <label key={c.id} className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <input {...form2.register('courses')} type="checkbox" value={c.id} className="w-4 h-4 text-orange-500 rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-700 text-sm">{c.name}</p>
                        <p className="text-xs text-stone-400">LKR {c.fee.toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {form2.formState.errors.courses && <p className="text-red-500 text-xs mt-1">{form2.formState.errors.courses.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">Payment Method *</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[{ v: 'full', l: 'Full Payment', d: 'Pay the full amount at once' }, { v: 'installment', l: 'Installment Plan', d: 'Spread payments over 2-4 months' }].map(opt => (
                    <label key={opt.v} className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <input {...form2.register('paymentMethod')} type="radio" value={opt.v} className="mt-0.5 w-4 h-4 text-orange-500" />
                      <div><p className="font-medium text-stone-700 text-sm">{opt.l}</p><p className="text-xs text-stone-400">{opt.d}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors hover:border-stone-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && step1Data && step2Data && (
            <div>
              <h2 className="text-lg font-bold text-stone-800 mb-5">Review & Submit</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-stone-700 text-sm">Personal Information</p>
                    <button onClick={() => setStep(1)} className="text-xs text-orange-500 hover:text-orange-600">Edit</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                    <div><span className="text-stone-400">Name: </span><span className="text-stone-700">{step1Data.fullName}</span></div>
                    <div><span className="text-stone-400">NIC: </span><span className="text-stone-700">{step1Data.nic}</span></div>
                    <div><span className="text-stone-400">Phone: </span><span className="text-stone-700">{step1Data.phone}</span></div>
                    <div><span className="text-stone-400">Email: </span><span className="text-stone-700">{step1Data.email}</span></div>
                    <div><span className="text-stone-400">City: </span><span className="text-stone-700">{step1Data.city}, {step1Data.district}</span></div>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-stone-700 text-sm">Course Selection</p>
                    <button onClick={() => setStep(2)} className="text-xs text-orange-500 hover:text-orange-600">Edit</button>
                  </div>
                  <div className="space-y-1 text-sm">
                    {step2Data.courses.map(cId => {
                      const c = COURSES.find(x => x.id === cId)
                      return c ? <p key={cId} className="text-stone-700">{c.name}</p> : null
                    })}
                    <p className="text-stone-500 mt-2">Payment: <span className="capitalize font-medium text-stone-700">{step2Data.paymentMethod}</span></p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-3 rounded-xl font-semibold text-sm hover:border-stone-300">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</span> : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
