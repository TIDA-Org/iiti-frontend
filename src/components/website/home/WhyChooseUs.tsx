import { Award, Users, Briefcase, FileCheck, Building, Clock } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const FEATURES = [
  { icon: Award, title: 'TVEC & ISO 9001:2015 Accredited Training', desc: 'Nationally recognized certifications meeting international quality standards.' },
  { icon: Users, title: 'Experienced Certified Instructors', desc: 'Learn from industry professionals with years of hands-on experience.' },
  { icon: Briefcase, title: '100% Job Placement Assistance', desc: 'We connect graduates with leading employers locally and internationally.' },
  { icon: FileCheck, title: 'NVQ Level 3 Internationally Recognized Certificate', desc: 'Your qualification is valued by employers across the GCC and beyond.' },
  { icon: Building, title: 'Modern Training Facility in Pannipitiya', desc: 'State-of-the-art equipment and training grounds for practical learning.' },
  { icon: Clock, title: 'Flexible Intake Schedules', desc: 'Multiple batch start dates throughout the year to fit your schedule.' },
]

export function WhyChooseUs() {
  return (
    <section className="py-24" style={{ backgroundColor: '#FAFAF9' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <ScrollReveal direction="left">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-8xl font-extrabold text-orange-500 opacity-20" style={{ fontFamily: 'Outfit, sans-serif' }}>IITI</div>
                  <p className="text-stone-400 text-sm mt-2">Training Excellence Since 2014</p>
                </div>
              </div>
              {/* Accent card */}
              <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-extrabold" style={{ fontFamily: 'Outfit, sans-serif' }}>10+</div>
                <div className="text-xs font-medium opacity-90">Years of Excellence</div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right features */}
          <div>
            <ScrollReveal>
              <SectionLabel>Why Choose IITI</SectionLabel>
              <h2
                className="text-4xl font-extrabold text-stone-900 mb-10 leading-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                The Smart Choice for
                <br />
                <span className="text-orange-500">Professional Training</span>
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <ScrollReveal key={feature.title} delay={i * 0.08}>
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-800 text-sm leading-tight mb-1">{feature.title}</h4>
                        <p className="text-stone-500 text-xs leading-relaxed">{feature.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
