import Link from 'next/link'
import { Award, CreditCard, GraduationCap } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const CERTS = [
  {
    icon: Award,
    title: 'Institute Certificate',
    description: 'Officially issued by IITI upon successful completion of the training programme. Recognized by all major employers in Sri Lanka.',
  },
  {
    icon: CreditCard,
    title: 'Skill ID Card',
    description: 'A unique identification card confirming your verified trade skill — QR-enabled for instant verification by employers.',
  },
  {
    icon: GraduationCap,
    title: 'NVQ Level 3 Certificate',
    description: 'Issued by TVEC — nationally and internationally recognized. Verified via the TVEC portal. Opens international career opportunities.',
  },
]

export function CertificatesSection() {
  return (
    <section className="py-24" style={{ backgroundColor: '#0A0A0A' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel light>Certification</SectionLabel>
          <h2
            className="text-4xl lg:text-5xl font-extrabold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            What You Receive After
            <span className="text-orange-500"> Graduation</span>
          </h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Complete your training and receive three industry-recognized credentials
            that open doors to local and international employment.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {CERTS.map((cert, i) => {
            const Icon = cert.icon
            return (
              <ScrollReveal key={cert.title} delay={i * 0.12}>
                <div className="bg-stone-900 border border-stone-800 hover:border-orange-500/40 rounded-2xl p-8 text-center transition-colors duration-300 group">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-orange-500/20 transition-colors">
                    <Icon className="w-8 h-8 text-orange-400" />
                  </div>
                  <h3
                    className="text-lg font-bold text-white mb-3"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {cert.title}
                  </h3>
                  <p className="text-stone-400 text-sm leading-relaxed">{cert.description}</p>
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
            Verify a Certificate
          </Link>
        </div>
      </div>
    </section>
  )
}
