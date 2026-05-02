'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock3, ExternalLink, Mail, MapPin, MessageSquareText, Phone } from 'lucide-react'
import { toast } from 'sonner'

import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { usePublicSiteSettings } from '@/components/website/layout/PublicSiteSettingsProvider'
import { delay } from '@/lib/utils'

const schema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Valid email required'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.replace(/\D/g, '').length >= 9, 'Enter a valid phone number'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { settings } = usePublicSiteSettings()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Our Location',
      lines: [settings.contactAddress].filter(Boolean),
      accent: 'from-orange-100 to-amber-50',
    },
    {
      icon: Phone,
      title: 'Call or WhatsApp',
      lines: [settings.contactPhone, settings.mobilePhone].filter(Boolean),
      accent: 'from-emerald-100 to-white',
    },
    {
      icon: Mail,
      title: 'Email Support',
      lines: [settings.contactEmail].filter(Boolean),
      accent: 'from-sky-100 to-white',
    },
  ].filter((card) => card.lines.length > 0)

  const quickNotes = [
    {
      icon: Clock3,
      title: 'Response Window',
      description: 'Most inquiries are answered within one business day.',
    },
    {
      icon: MessageSquareText,
      title: 'Best for Enquiries',
      description: 'Use the form for course guidance, enrollment help, and general support requests.',
    },
  ]

  const onSubmit = async () => {
    setIsLoading(true)
    await delay(800)
    setIsLoading(false)
    toast.success('Your message has been received. We will contact you shortly.')
    reset()
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-linear-to-br from-stone-950 via-stone-900 to-stone-800 px-4 py-24 text-center">
        <div className="absolute inset-x-0 top-0 h-48 bg-linear-to-b from-orange-500/10 to-transparent" />
        <div className="absolute right-0 top-8 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-44 w-44 rounded-full bg-amber-200/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <ScrollReveal>
            <SectionLabel light className="justify-center">
              Get In Touch
            </SectionLabel>
            <h1 className="mb-5 text-4xl font-bold text-white sm:text-5xl leading-tight tracking-tight">
              Let&apos;s Talk About
              <span className="block text-orange-500">Your Training Journey</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              Reach out for course guidance, enrollment assistance, schedule questions, or direct help from the institute team.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-6">
            <ScrollReveal>
              <div className="rounded-4xl border border-stone-200 bg-white p-7 shadow-[0_24px_70px_-48px_rgba(28,25,23,0.35)] sm:p-8">
                <SectionLabel className="mb-4">Contact Details</SectionLabel>
                <h2 className="text-3xl font-bold text-stone-900 leading-tight tracking-tight">
                  Reach the institute through the channel that works for you.
                </h2>

                <div className="mt-8 space-y-4">
                  {contactCards.map((info) => {
                    const Icon = info.icon
                    return (
                      <div key={info.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="mb-1 text-sm font-semibold text-stone-900">{info.title}</p>
                          {info.lines.map((line) => (
                            <p key={line} className="text-sm leading-7 text-stone-600">
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 grid gap-3 sm:auto-rows-fr sm:grid-cols-2">
                  {quickNotes.map((note) => {
                    const Icon = note.icon
                    return (
                      <div key={note.title} className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-4">
                        <Icon className="mb-3 h-5 w-5 text-orange-500" />
                        <p className="text-sm font-semibold text-stone-900">{note.title}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-500">{note.description}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </ScrollReveal>
            </div>

          <ScrollReveal direction="right">
            <div className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-[0_28px_80px_-52px_rgba(28,25,23,0.35)]">
              <div className="border-b border-stone-200 bg-linear-to-r from-orange-50 via-white to-stone-50 px-8 py-7">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Message Form</p>
                <h2 className="mt-3 text-2xl font-bold text-stone-900 leading-tight tracking-tight">
                  Send Us a Message
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-7 text-stone-500">
                  Share your question and the team will get back to you with the right course or enrollment guidance.
                </p>
              </div>

              <div className="p-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">Full Name *</label>
                      <input
                        {...register('name')}
                        aria-invalid={errors.name ? 'true' : 'false'}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">Email *</label>
                      <input
                        {...register('email')}
                        type="email"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        placeholder="you@example.com"
                        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Phone</label>
                    <input
                      {...register('phone')}
                      aria-invalid={errors.phone ? 'true' : 'false'}
                      placeholder="07XXXXXXXX"
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Subject *</label>
                    <select
                      {...register('subject')}
                      aria-invalid={errors.subject ? 'true' : 'false'}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="course_inquiry">Course Inquiry</option>
                      <option value="application">Application</option>
                      <option value="general">General</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-stone-700">Message *</label>
                    <textarea
                      {...register('message')}
                      rows={5}
                      aria-invalid={errors.message ? 'true' : 'false'}
                      placeholder="Tell us how we can help you"
                      className="w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:bg-orange-300"
                  >
                    {isLoading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </ScrollReveal>
          </div>

          <ScrollReveal delay={0.12}>
            <div className="relative mt-10 overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-[0_24px_70px_-48px_rgba(28,25,23,0.35)]">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 bg-linear-to-b from-white via-white/95 to-transparent px-5 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">Location Map</p>
                  <p className="mt-1 text-sm text-stone-600">Explore the institute location directly on the map.</p>
                </div>
                <Link
                  href={settings.googleMapsLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-sm font-medium text-orange-600 shadow-sm ring-1 ring-stone-200 transition-colors hover:bg-orange-50"
                >
                  Open in Maps
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
              <iframe
                src={settings.googleMapsEmbedUrl}
                width="100%"
                height="520"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="IITI Location - Pannipitiya, Sri Lanka"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
