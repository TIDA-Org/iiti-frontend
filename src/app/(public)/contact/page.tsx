'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, Phone, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'
import { INSTITUTE_INFO } from '@/lib/constants'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async () => {
    setIsLoading(true)
    await delay(800)
    setIsLoading(false)
    toast.success('Your message has been received. We will contact you shortly.')
    reset()
  }

  return (
    <div>
      <section className="bg-gradient-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Get In Touch</SectionLabel>
          <h1 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Us</h1>
          <p className="text-stone-400 max-w-xl mx-auto">
            We&apos;re here to help. Reach out for course information, enrollment queries, or anything else.
          </p>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left - info & map */}
            <div className="space-y-6">
              <ScrollReveal>
                {[
                  { icon: MapPin, title: 'Location', lines: [INSTITUTE_INFO.address] },
                  { icon: Phone, title: 'Phone', lines: [INSTITUTE_INFO.telephone, INSTITUTE_INFO.mobile] },
                  { icon: Mail, title: 'Email', lines: [INSTITUTE_INFO.email] },
                ].map((info) => {
                  const Icon = info.icon
                  return (
                    <div key={info.title} className="flex gap-4 bg-white rounded-xl p-5 border border-stone-100">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 text-sm mb-1">{info.title}</p>
                        {info.lines.map(l => <p key={l} className="text-stone-500 text-sm">{l}</p>)}
                      </div>
                    </div>
                  )
                })}
              </ScrollReveal>
              <ScrollReveal delay={0.1}>
                <div className="rounded-2xl overflow-hidden border border-stone-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9!2d79.9!3d6.84!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTAnMjQuMCJOIDc5wrA1NCcwMC4wIkU!5e0!3m2!1sen!2slk!4v1"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="IITI Location - Pannipitiya, Sri Lanka"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Right - form */}
            <ScrollReveal direction="right">
              <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm">
                <h2 className="text-xl font-bold text-stone-800 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Send Us a Message</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name *</label>
                      <input {...register('name')} className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Email *</label>
                      <input {...register('email')} type="email" className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone</label>
                    <input {...register('phone')} className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Subject *</label>
                    <select {...register('subject')} className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white">
                      <option value="">Select a subject</option>
                      <option value="course_inquiry">Course Inquiry</option>
                      <option value="application">Application</option>
                      <option value="general">General</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Message *</label>
                    <textarea {...register('message')} rows={4} className="w-full px-3.5 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-lg font-semibold text-sm transition-colors"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  )
}
