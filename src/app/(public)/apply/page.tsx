'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ArrowRight, ArrowLeft, CircleAlert } from 'lucide-react'
import { toast } from 'sonner'
import { DISTRICTS, PROVINCES } from '@/lib/constants'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { useApi } from '@/hooks/useApi'
import { apiGetCourses } from '@/lib/api/courses'
import { apiSelfRegisterStudent } from '@/lib/api/students'
import {
  extractSriLankanNicDetails,
  isValidSriLankanNic,
  isValidSriLankanPhone,
  normalizeSriLankanPhone,
} from '@/lib/validators'

const optionalEmailSchema = z
  .union([z.string().trim().email('Valid email required'), z.literal('')])
  .transform((value) => (value === '' ? undefined : value))

const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  nameWithInitials: z.string().min(2, 'Name with initials is required'),
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
    .refine(isValidSriLankanPhone, 'Invalid phone. Use 07XXXXXXXX or +947XXXXXXXX.'),
  email: optionalEmailSchema,
  addressLine1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  district: z.string().refine((value) => DISTRICTS.includes(value), 'Please select a district'),
  province: z.string().refine((value) => PROVINCES.includes(value), 'Please select a province'),
})

const step2Schema = z.object({
  courses: z.array(z.string()).min(1, 'Please select at least one course'),
  paymentMethod: z.enum(['full', 'installment']),
})

type Step1Input = z.input<typeof step1Schema>
type Step1Output = z.output<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Lang = 'en' | 'si'

const COPY: Record<Lang, Record<string, string>> = {
  en: {
    onlineApplication: 'Online Application',
    applyForCourse: 'Apply for a Course',
    personalInfo: 'Personal Info',
    courseAndPayment: 'Course & Payment',
    reviewAndSubmit: 'Review & Submit',
    personalInformation: 'Personal Information',
    fullName: 'Full Name *',
    nameWithInitials: 'Name with Initials *',
    nicNumber: 'NIC Number *',
    dateOfBirth: 'Date of Birth *',
    gender: 'Gender *',
    phone: 'Phone *',
    email: 'Email',
    addressLine1: 'Address Line 1 *',
    city: 'City *',
    district: 'District *',
    province: 'Province *',
    select: 'Select',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    continue: 'Continue',
    courseSelectionPayment: 'Course Selection & Payment',
    selectProgramme: 'Select Programme(s) *',
    paymentMethod: 'Payment Method *',
    fullPayment: 'Full Payment',
    fullPaymentDesc: 'Pay the full amount at once',
    installment: 'Installment Plan',
    installmentDesc: 'Spread payments over 2-4 months',
    back: 'Back',
    noCourses: 'No active courses available right now.',
    reviewSubmit: 'Review & Submit',
    personalInformationCard: 'Personal Information',
    courseSelectionCard: 'Course Selection',
    edit: 'Edit',
    name: 'Name:',
    nic: 'NIC:',
    phoneLabel: 'Phone:',
    emailLabel: 'Email:',
    cityLabel: 'City:',
    payment: 'Payment:',
    submitting: 'Submitting...',
    submitApplication: 'Submit Application',
    applicationSubmitted: 'Application Submitted!',
    reference: 'Your application reference:',
    followUp: 'We will contact you within 2 business days.',
    whatNext: 'What happens next?',
    next1: 'Admin review of your application',
    next2: 'Payment confirmation',
    next3: 'Enrollment activation + Student ID issued',
    next4: 'Portal access credentials shared through your provided contact details',
    backHome: 'Back to Home',
    language: 'Language',
  },
  si: {
    onlineApplication: 'මාර්ගගත අයදුම්පත',
    applyForCourse: 'පාඨමාලාවක් සඳහා අයදුම් කරන්න',
    personalInfo: 'පෞද්ගලික තොරතුරු',
    courseAndPayment: 'පාඨමාලාව සහ ගෙවීම',
    reviewAndSubmit: 'සමාලෝචනය සහ යැවීම',
    personalInformation: 'පෞද්ගලික තොරතුරු',
    fullName: 'සම්පූර්ණ නම *',
    nameWithInitials: 'මුල් අකුරු සමඟ නම *',
    nicNumber: 'ජා.හැ. අංකය *',
    dateOfBirth: 'උපන් දිනය *',
    gender: 'ස්ත්‍රී/පුරුෂ භාවය *',
    phone: 'දුරකථන අංකය *',
    email: 'විද්‍යුත් තැපෑල',
    addressLine1: 'ලිපිනය (පළමු පේළිය) *',
    city: 'නගරය *',
    district: 'දිස්ත්‍රික්කය *',
    province: 'පළාත *',
    select: 'තෝරන්න',
    male: 'පුරුෂ',
    female: 'ස්ත්‍රී',
    other: 'වෙනත්',
    continue: 'ඉදිරියට',
    courseSelectionPayment: 'පාඨමාලා තේරීම සහ ගෙවීම',
    selectProgramme: 'පාඨමාලා(ව) තෝරන්න *',
    paymentMethod: 'ගෙවීම් ක්‍රමය *',
    fullPayment: 'සම්පූර්ණ ගෙවීම',
    fullPaymentDesc: 'මුළු මුදල එකවර ගෙවන්න',
    installment: 'කොටස් වාරික',
    installmentDesc: 'මාස 2-4 අතර වාරික ගෙවන්න',
    back: 'ආපසු',
    noCourses: 'දැනට සක්‍රීය පාඨමාලා නොමැත.',
    reviewSubmit: 'සමාලෝචනය සහ යැවීම',
    personalInformationCard: 'පෞද්ගලික තොරතුරු',
    courseSelectionCard: 'පාඨමාලා තේරීම',
    edit: 'සංස්කරණය',
    name: 'නම:',
    nic: 'ජා.හැ. අංකය:',
    phoneLabel: 'දුරකථනය:',
    emailLabel: 'විද්‍යුත් තැපෑල:',
    cityLabel: 'නගරය:',
    payment: 'ගෙවීම:',
    submitting: 'යවමින්...',
    submitApplication: 'අයදුම්පත යවන්න',
    applicationSubmitted: 'අයදුම්පත සාර්ථකව යවා ඇත!',
    reference: 'ඔබගේ යොමු අංකය:',
    followUp: 'වැඩිදුර සඳහා වැඩ දිනයන් 2ක් තුළ අපි ඔබව සම්බන්ධ කරමු.',
    whatNext: 'ඊළඟට සිදුවන්නේ කුමක්ද?',
    next1: 'ඔබගේ අයදුම්පත පරිපාලන සමාලෝචනය',
    next2: 'ගෙවීම් තහවුරු කිරීම',
    next3: 'ලියාපදිංචිය සක්‍රීය කර සිසුවාගේ අංකය නිකුත් කිරීම',
    next4: 'ඔබ ලබාදුන් සම්බන්ධතා තොරතුරු හරහා පෝර්ටල් පිවිසුම් විස්තර ලබාදීම',
    backHome: 'මුල් පිටුවට',
    language: 'භාෂාව',
  },
}

export default function ApplyPage() {
  const [lang, setLang] = useState<Lang>('en')
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1Output | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [refNo, setRefNo] = useState('')

  const { data: coursesData } = useApi(() => apiGetCourses(), [])
  const courses = (coursesData || []).filter((c) => c.is_active)
  const t = useMemo(() => COPY[lang], [lang])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('apply-lang') : null
    if (saved === 'en' || saved === 'si') {
      setLang(saved)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('apply-lang', lang)
    }
  }, [lang])

  const form1 = useForm<Step1Input, unknown, Step1Output>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema), defaultValues: { courses: [], paymentMethod: 'full' } })

  const nicValue = form1.watch('nic')

  useEffect(() => {
    if (!nicValue || !isValidSriLankanNic(nicValue)) {
      return
    }

    const details = extractSriLankanNicDetails(nicValue)
    form1.setValue('dateOfBirth', details.dateOfBirth, { shouldValidate: true })
    form1.setValue('gender', details.gender, { shouldValidate: true })
  }, [form1, nicValue])

  const onStep1 = (data: Step1Output) => { setStep1Data(data); setStep(2) }
  const onStep2 = (data: Step2Data) => { setStep2Data(data); setStep(3) }

  const onSubmit = async () => {
    if (!step1Data || !step2Data) return

    setIsLoading(true)
    try {
      const selectedCourses = courses.filter((course) => step2Data.courses.includes(course.id))
      const isDoingNvq = selectedCourses.some((course) => course.course_type === 'nvq_course' || course.has_nvq_option)

      const student = await apiSelfRegisterStudent({
        full_name: step1Data.fullName,
        name_for_certificate: step1Data.nameWithInitials,
        nic_number: step1Data.nic,
        date_of_birth: step1Data.dateOfBirth,
        gender: step1Data.gender,
        address_line1: step1Data.addressLine1,
        city: step1Data.city,
        district: step1Data.district,
        province: step1Data.province,
        phone_primary: normalizeSriLankanPhone(step1Data.phone),
        email: step1Data.email || null,
        preferred_language: lang,
        is_doing_nvq: isDoingNvq,
        has_previous_nvq: false,
      })

      setRefNo(student.student_number || student.id)
      setSubmitted(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setIsLoading(false)
    }
  }

  const getInputClass = (hasError = false) =>
    [
      'w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-800 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200',
      'placeholder:text-stone-400 focus:outline-none focus:ring-4',
      hasError
        ? 'border-rose-400 bg-rose-50/60 focus:border-rose-500 focus:ring-rose-100'
        : 'border-stone-200 hover:border-orange-300 focus:border-orange-500 focus:ring-orange-100',
    ].join(' ')

  const labelClass = 'mb-1.5 block text-sm font-medium text-stone-700'
  const errorClass = 'mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600'

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-stone-100 p-10 text-center max-w-lg w-full shadow-xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2 leading-tight tracking-tight">{t.applicationSubmitted}</h2>
          <p className="text-stone-500 mb-4">{t.reference} <span className="font-mono font-bold text-orange-600">{refNo}</span></p>
          <p className="text-stone-400 text-sm mb-8">{t.followUp}</p>
          <div className="bg-stone-50 rounded-xl p-5 text-left text-sm space-y-2 mb-6">
            <p className="font-semibold text-stone-700 mb-3">{t.whatNext}</p>
            {[t.next1, t.next2, t.next3, t.next4].map((s, i) => (
              <div key={i} className="flex gap-2.5"><span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center shrink-0">{i+1}</span><span className="text-stone-600">{s}</span></div>
            ))}
          </div>
          <Link href="/" className="inline-block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition-colors">{t.backHome}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <SectionLabel className="justify-center">{t.onlineApplication}</SectionLabel>
          <h1 className="text-3xl font-bold text-stone-900 leading-tight tracking-tight">{t.applyForCourse}</h1>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-1.5 bg-white">
            <span className="text-xs text-stone-500 font-medium">{t.language}</span>
            <button type="button" onClick={() => setLang('en')} className={`text-xs px-2 py-0.5 rounded ${lang === 'en' ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>EN</button>
            <button type="button" onClick={() => setLang('si')} className={`text-xs px-2 py-0.5 rounded ${lang === 'si' ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-stone-100'}`}>සිං</button>
          </div>
        </div>

        {/* Step indicator */}
        <div className="mb-10 px-1">
          <div className="grid grid-cols-3">
            {[t.personalInfo, t.courseAndPayment, t.reviewAndSubmit].map((label, i) => (
              <div key={label} className="relative flex min-w-0 flex-col items-center px-1 text-center">
                {i < 2 && (
                  <div
                    className={`absolute left-[calc(50%+1rem)] right-[-50%] top-4 h-0.5 ${
                      step > i + 1 ? 'bg-green-400' : 'bg-stone-200'
                    }`}
                  />
                )}

                <div className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-400'}`}>
                  {step > i + 1 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`mt-1.5 min-h-10 text-center text-xs font-medium leading-tight sm:min-h-0 ${step === i + 1 ? 'text-orange-500' : 'text-stone-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200/70 bg-white/95 p-6 shadow-[0_16px_45px_-24px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:p-8">
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
              <h2 className="mb-5 text-lg font-bold text-stone-800">{t.personalInformation}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>{t.fullName}</label>
                  <input {...form1.register('fullName')} className={getInputClass(Boolean(form1.formState.errors.fullName))} />
                  {form1.formState.errors.fullName && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.nameWithInitials}</label>
                  <input {...form1.register('nameWithInitials')} className={getInputClass(Boolean(form1.formState.errors.nameWithInitials))} />
                  {form1.formState.errors.nameWithInitials && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.nameWithInitials.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.nicNumber}</label>
                  <input {...form1.register('nic')} className={getInputClass(Boolean(form1.formState.errors.nic))} />
                  {form1.formState.errors.nic && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.nic.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.dateOfBirth}</label>
                  <input {...form1.register('dateOfBirth')} type="date" className={getInputClass(Boolean(form1.formState.errors.dateOfBirth))} />
                  {form1.formState.errors.dateOfBirth && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.gender}</label>
                  <select {...form1.register('gender')} className={getInputClass(Boolean(form1.formState.errors.gender))}>
                    <option value="">{t.select}</option>
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="other">{t.other}</option>
                  </select>
                  {form1.formState.errors.gender && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.gender.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.phone}</label>
                  <input {...form1.register('phone')} className={getInputClass(Boolean(form1.formState.errors.phone))} />
                  {form1.formState.errors.phone && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.email}</label>
                <input {...form1.register('email')} type="email" className={getInputClass(Boolean(form1.formState.errors.email))} />
                {form1.formState.errors.email && (
                  <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>{t.addressLine1}</label>
                <input {...form1.register('addressLine1')} className={getInputClass(Boolean(form1.formState.errors.addressLine1))} />
                {form1.formState.errors.addressLine1 && (
                  <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.addressLine1.message}</p>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t.city}</label>
                  <input {...form1.register('city')} className={getInputClass(Boolean(form1.formState.errors.city))} />
                  {form1.formState.errors.city && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.district}</label>
                  <select {...form1.register('district')} className={getInputClass(Boolean(form1.formState.errors.district))}>
                    <option value="">{t.select}</option>
                    {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {form1.formState.errors.district && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.district.message}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>{t.province}</label>
                  <select {...form1.register('province')} className={getInputClass(Boolean(form1.formState.errors.province))}>
                    <option value="">{t.select}</option>
                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {form1.formState.errors.province && (
                    <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form1.formState.errors.province.message}</p>
                  )}
                </div>
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors mt-4">
                {t.continue} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-6">
              <h2 className="text-lg font-bold text-stone-800 mb-5">{t.courseSelectionPayment}</h2>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">{t.selectProgramme}</label>
                <div className="space-y-2">
                  {courses.map(c => (
                    <label key={c.id} className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <input {...form2.register('courses')} type="checkbox" value={c.id} className="w-4 h-4 text-orange-500 rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-stone-700 text-sm">{lang === 'si' ? (c.name_si || c.name) : c.name}</p>
                        <p className="text-xs text-stone-400">LKR {c.total_fee.toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {courses.length === 0 && <p className="text-slate-500 text-xs mt-2">{t.noCourses}</p>}
                {form2.formState.errors.courses && (
                  <p className={errorClass}><CircleAlert className="h-3.5 w-3.5" />{form2.formState.errors.courses.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">{t.paymentMethod}</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[{ v: 'full', l: t.fullPayment, d: t.fullPaymentDesc }, { v: 'installment', l: t.installment, d: t.installmentDesc }].map(opt => (
                    <label key={opt.v} className="flex items-start gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer hover:border-orange-300 hover:bg-orange-50 transition-colors">
                      <input {...form2.register('paymentMethod')} type="radio" value={opt.v} className="mt-0.5 w-4 h-4 text-orange-500" />
                      <div><p className="font-medium text-stone-700 text-sm">{opt.l}</p><p className="text-xs text-stone-400">{opt.d}</p></div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-3 rounded-xl font-semibold text-sm transition-colors hover:border-stone-300">
                  <ArrowLeft className="w-4 h-4" /> {t.back}
                </button>
                <button type="submit" className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                  {t.continue} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && step1Data && step2Data && (
            <div>
              <h2 className="text-lg font-bold text-stone-800 mb-5">{t.reviewSubmit}</h2>
              <div className="space-y-4 mb-6">
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-stone-700 text-sm">{t.personalInformationCard}</p>
                    <button onClick={() => setStep(1)} className="text-xs text-orange-500 hover:text-orange-600">{t.edit}</button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-y-2 text-sm">
                    <div><span className="text-stone-400">{t.name} </span><span className="text-stone-700">{step1Data.fullName}</span></div>
                    <div><span className="text-stone-400">{t.nic} </span><span className="text-stone-700">{step1Data.nic}</span></div>
                    <div><span className="text-stone-400">{t.phoneLabel} </span><span className="text-stone-700">{step1Data.phone}</span></div>
                    {step1Data.email ? <div><span className="text-stone-400">{t.emailLabel} </span><span className="text-stone-700">{step1Data.email}</span></div> : null}
                    <div><span className="text-stone-400">{t.cityLabel} </span><span className="text-stone-700">{step1Data.city}, {step1Data.district}</span></div>
                  </div>
                </div>
                <div className="bg-stone-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <p className="font-semibold text-stone-700 text-sm">{t.courseSelectionCard}</p>
                    <button onClick={() => setStep(2)} className="text-xs text-orange-500 hover:text-orange-600">{t.edit}</button>
                  </div>
                  <div className="space-y-1 text-sm">
                    {step2Data.courses.map(cId => {
                      const c = courses.find(x => x.id === cId)
                      return c ? <p key={cId} className="text-stone-700">{lang === 'si' ? (c.name_si || c.name) : c.name}</p> : null
                    })}
                    <p className="text-stone-500 mt-2">{t.payment} <span className="capitalize font-medium text-stone-700">{step2Data.paymentMethod}</span></p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 border border-stone-200 text-stone-600 px-5 py-3 rounded-xl font-semibold text-sm hover:border-stone-300">
                  <ArrowLeft className="w-4 h-4" /> {t.back}
                </button>
                <button
                  onClick={onSubmit}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                >
                  {isLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.submitting}</span> : t.submitApplication}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
