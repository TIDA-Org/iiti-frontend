import { Award, Users, Briefcase, FileCheck, Building, Clock } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { Card } from '@/components/ui/card'

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
    <section className="py-28 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <ScrollReveal direction="left">
            <div className="relative">
              <Card className="aspect-[4/3] overflow-hidden border-0 bg-linear-to-br from-slate-800 via-slate-900 to-slate-900 flex items-center justify-center shadow-lg">
                <div className="text-center relative z-10">
                  <div className="text-8xl font-bold text-orange-500/15">IITI</div>
                  <p className="text-slate-400 text-sm mt-3 font-regular">Training Excellence Since 2014</p>
                </div>
                {/* Decorative gradient orbs */}
                <div className="absolute -left-40 -top-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -right-40 -bottom-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
              </Card>
              {/* Accent card */}
              <Card className="absolute -bottom-6 -right-6 bg-linear-to-br from-orange-500 to-orange-600 text-white p-6 shadow-xl border-0">
                <div className="text-4xl font-bold tracking-tight">10+</div>
                <div className="text-xs font-semibold opacity-90 mt-1">Years of Excellence</div>
              </Card>
            </div>
          </ScrollReveal>

          {/* Right features */}
          <div>
            <ScrollReveal>
              <SectionLabel>Why Choose IITI</SectionLabel>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-12 leading-tight tracking-tight">
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
                    <Card className="p-4 border border-slate-200/50 hover:border-orange-200/50 hover:shadow-md transition-all duration-300 group bg-white">
                      <div className="flex gap-3">
                        <div className="w-11 h-11 rounded-lg bg-linear-to-br from-orange-50 to-orange-100 flex items-center justify-center shrink-0 group-hover:from-orange-100 group-hover:to-orange-200 transition-colors">
                          <Icon className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1">{feature.title}</h4>
                          <p className="text-slate-600 text-xs leading-relaxed font-regular">{feature.desc}</p>
                        </div>
                      </div>
                    </Card>
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
