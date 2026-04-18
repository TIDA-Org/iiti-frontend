"use client"

import Link from 'next/link'
import { Award, CreditCard, GraduationCap } from 'lucide-react'

import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { apiGetWebsiteCertificates } from '@/lib/api/website'

const CERTIFICATE_ICONS = {
  institute_certificate: Award,
  skill_id_card: CreditCard,
  nvq_certificate: GraduationCap,
} as const

const DEFAULT_CERTS = [
  {
    key: 'institute_certificate',
    icon: Award,
    title: 'Institute Certificate',
    description: 'Officially issued by IITI upon successful completion of the training programme. Recognized by all major employers in Sri Lanka.',
  },
  {
    key: 'skill_id_card',
    icon: CreditCard,
    title: 'Skill ID Card',
    description: 'A unique identification card confirming your verified trade skill — QR-enabled for instant verification by employers.',
  },
  {
    key: 'nvq_certificate',
    icon: GraduationCap,
    title: 'NVQ Level 3 Certificate',
    description: 'Issued by TVEC — nationally and internationally recognized. Verified via the TVEC portal. Opens international career opportunities.',
  },
]

export function CertificatesSection() {
  const { data } = useApi(() => apiGetWebsiteCertificates(), [])
  const certificates = data?.items?.length
    ? data.items.map((item) => ({
        ...item,
        icon: CERTIFICATE_ICONS[item.key as keyof typeof CERTIFICATE_ICONS] || Award,
      }))
    : DEFAULT_CERTS

  return (
    <section className="py-24" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel light>{data?.eyebrow || 'Certification'}</SectionLabel>
          <h2
            className="text-4xl lg:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {data?.title || 'What You Receive After'}
            <span className="text-orange-500"> {data?.title_highlight || 'Graduation'}</span>
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            {data?.description || 'Complete your training and receive three industry-recognized credentials that open doors to local and international employment.'}
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {certificates.map((cert, i) => {
            const Icon = cert.icon
            return (
              <ScrollReveal key={cert.key || cert.title} delay={i * 0.12}>
                <div className="group flex h-full min-h-88 flex-col rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center transition-colors duration-300 hover:border-orange-500/40">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-500/20 transition-colors">
                    <Icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3
                    className="mb-4 flex min-h-14 items-center justify-center text-lg font-bold text-white"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {cert.title}
                  </h3>
                  <p className="mx-auto mt-auto max-w-sm text-sm leading-relaxed text-stone-400">{cert.description}</p>
                </div>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="text-center">
          <Link
            href="/verify"
            className="inline-flex items-center gap-2 border border-orange-500/60 text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
          >
            {data?.verify_button_label || 'Verify a Certificate'}
          </Link>
        </div>
      </div>
    </section>
  )
}
