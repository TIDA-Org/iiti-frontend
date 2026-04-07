import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { AnimatedCounter } from '@/components/shared/AnimatedCounter'
import { INSTITUTE_INFO } from '@/lib/constants'
import { Award, Users, Building, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const MILESTONES = [
  { year: '2014', title: 'Institute Founded', desc: 'IITI established in Pannipitiya with a mission to provide quality heavy vehicle training.' },
  { year: '2016', title: 'TVEC Registration', desc: `Registered with Technical and Vocational Education Commission. Reg No: ${INSTITUTE_INFO.tvecRegNo}` },
  { year: '2018', title: 'NVQ Level 3 Accreditation', desc: 'All three programmes receive NVQ Level 3 certification from TVEC.' },
  { year: '2020', title: 'ISO 9001:2015 Certification', desc: `Achieved ISO 9001:2015 Quality Management certification. Certificate No: ${INSTITUTE_INFO.isoNumber}` },
  { year: '2022', title: 'International Placements', desc: 'Began facilitating GCC placements for graduates. First batch of 10 students placed in UAE.' },
  { year: '2024', title: '1000+ Graduates', desc: 'Reached the milestone of over 1000 trained and certified operators.' },
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <SectionLabel light className="justify-center">About IITI</SectionLabel>
            <h1 className="text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              About Imasha International
              <span className="text-orange-500"> Training Institute</span>
            </h1>
            <p className="text-stone-400 text-lg max-w-2xl mx-auto">
              Sri Lanka&apos;s premier TVEC-accredited heavy vehicle training institute, committed to producing industry-ready operators since 2014.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: 1000, suffix: '+', label: 'Graduates Trained' },
            { value: 10, suffix: '+', label: 'Years of Excellence' },
            { value: 3, suffix: '', label: 'NVQ Programmes' },
            { value: 100, suffix: '%', label: 'TVEC Accredited' },
          ].map((s, i) => (
            <ScrollReveal key={s.label} delay={i * 0.1} className="text-center">
              <div className="text-4xl font-extrabold text-orange-500 mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <div className="text-stone-500 text-sm">{s.label}</div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <SectionLabel className="justify-center">Our Purpose</SectionLabel>
            <h2 className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Vision & Mission</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            <ScrollReveal delay={0}>
              <div className="bg-white rounded-2xl p-8 border border-stone-200 h-full">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                  <Award className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Vision</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4 font-sinhala" lang="si">
                  ශ්‍රී ලංකාවේ වර යන්ත්‍රෝපකරණ ක්ෂේත්‍රය තුළ නවීන තාක්ෂණික වෘත්තීයවේදින් බිහි කිරීම, වෘත්තීය දැනුම හා පළපුරුද්ද මගින් ලෝකයේ පිළිගත් මට්ටමේ පුහුණුවක් ලබාදීම අපගේ අරමුණයි.
                </p>
                <p className="text-stone-500 text-sm leading-relaxed italic border-t border-stone-100 pt-4">
                  &quot;To produce modern technical professionals in Sri Lanka&apos;s heavy machinery sector, providing world-recognized training through professional knowledge and experience.&quot;
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.1}>
              <div className="bg-white rounded-2xl p-8 border border-stone-200 h-full">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Mission</h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4 font-sinhala" lang="si">
                  ISO 9001:2015 සහ TVEC ප්‍රමිතින් අනුව උසස් තාක්ෂණික පුහුණු ලබාදීම සහ අගයේ පිළිගත් දේශීය හා විදේශීය රැකියා අවස්ථා ලබාදීමට සුදුසුකම් ඇති වෘත්තීයවේදීන් බිහි කිරීම.
                </p>
                <p className="text-stone-500 text-sm leading-relaxed italic border-t border-stone-100 pt-4">
                  &quot;To provide high-quality technical training in accordance with ISO 9001:2015 and TVEC standards, and to produce professionals qualified for valued local and international employment opportunities.&quot;
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            <SectionLabel className="justify-center">Our Journey</SectionLabel>
            <h2 className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI Milestones</h2>
          </ScrollReveal>
          <div className="relative">
            <div className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-px bg-orange-200 lg:-translate-x-px" />
            {MILESTONES.map((m, i) => (
              <ScrollReveal key={m.year} delay={i * 0.1} className={`relative flex gap-6 mb-8 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                <div className="flex-1 hidden lg:block" />
                <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 w-5 h-5 rounded-full bg-orange-500 border-4 border-white shadow-md z-10 mt-2" />
                <div className="flex-1 pl-12 lg:pl-0">
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">{m.year}</span>
                    <h4 className="font-bold text-stone-800 mt-1 mb-2">{m.title}</h4>
                    <p className="text-stone-500 text-sm">{m.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4">
          <ScrollReveal className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>Accreditations</h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'ISO 9001:2015', subtitle: `Certificate No: ${INSTITUTE_INFO.isoNumber}`, desc: 'Quality Management System certification ensuring our training meets international quality standards.', color: 'bg-blue-600' },
              { title: 'TVEC Registered', subtitle: `Reg No: ${INSTITUTE_INFO.tvecRegNo}`, desc: 'Registered with the Technical and Vocational Education Commission of Sri Lanka.', color: 'bg-green-600' },
            ].map((acc) => (
              <ScrollReveal key={acc.title}>
                <div className="bg-white rounded-2xl p-6 border border-stone-200 flex gap-5 items-start">
                  <div className={`w-14 h-14 ${acc.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-800 mb-0.5">{acc.title}</h3>
                    <p className="text-xs text-stone-400 mb-2">{acc.subtitle}</p>
                    <p className="text-sm text-stone-500">{acc.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-3xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Start Your Training Today</h2>
          <p className="text-orange-100 mb-8">Join over 1000 graduates who have built successful careers through IITI training.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="bg-white text-orange-600 hover:bg-orange-50 px-7 py-3 rounded-lg font-semibold text-sm transition-colors">Apply Now</Link>
            <Link href="/contact" className="border border-white/40 text-white hover:bg-white/10 px-7 py-3 rounded-lg font-semibold text-sm transition-colors">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
