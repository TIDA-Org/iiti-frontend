import Link from 'next/link'
import { ArrowRight, Clock, Award, Zap, Book } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { Card } from '@/components/ui/card'

const COURSES = [
  {
    title: 'Forklift Operator Training Programme',
    href: '/courses/forklift',
    duration: '4 Weeks',
    description: 'Comprehensive forklift operation training covering safety protocols, load handling, site navigation, and TVEC examination preparation.',
    icon: Zap,
    accentColor: 'from-orange-500 to-orange-600',
    code: 'IITI-FO-001',
  },
  {
    title: 'Excavator Operator Training Programme',
    href: '/courses/excavator',
    duration: '6 Weeks',
    description: 'Master excavator controls, digging techniques, site safety, and heavy earthmoving operations aligned with NVQ Level 3 standards.',
    icon: Award,
    accentColor: 'from-orange-500 to-orange-600',
    code: 'IITI-EX-002',
  },
  {
    title: 'Backhoe Loader Operator Training Programme',
    href: '/courses/backhoe-loader',
    duration: '5 Weeks',
    description: 'Dual-function machine operation: loader bucket and backhoe techniques, safety compliance, and industry-standard assessment.',
    icon: Book,
    accentColor: 'from-orange-500 to-orange-600',
    code: 'IITI-BL-003',
  },
]

export function CoursesPreview() {
  return (
    <section className="py-28 bg-gradient-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-16">
          <SectionLabel className="justify-center">Our Programmes</SectionLabel>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Industry-Ready Training for
            <br />
            <span className="text-orange-500">Modern Heavy Machinery</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            All programmes are TVEC registered and lead to NVQ Level 3 certification — recognized by local and international employers.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {COURSES.map((course, i) => {
            const IconComponent = course.icon
            return (
              <ScrollReveal key={course.href} delay={i * 0.1}>
                <Card className="group relative overflow-hidden border border-slate-200/50 bg-white hover:border-slate-300 transition-all duration-300 hover:shadow-lg h-full flex flex-col">
                  {/* Accent line at top */}
                  <div className={`h-1 w-full bg-gradient-to-r ${course.accentColor}`} />
                  
                  <div className="p-8 flex flex-col flex-1">
                    {/* Icon and Badge Row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${course.accentColor} flex items-center justify-center text-white shadow-sm`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                        {course.code}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-slate-900 mb-3 leading-snug group-hover:text-orange-600 transition-all duration-300">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-600 leading-relaxed flex-1 mb-6">
                      {course.description}
                    </p>

                    {/* Bottom Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      {/* Certifications */}
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded">
                          NVQ Level 3
                        </span>
                        <span className="text-xs font-medium bg-orange-50 text-orange-700 px-2.5 py-1 rounded">
                          TVEC Registered
                        </span>
                      </div>

                      {/* Duration and CTA */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{course.duration}</span>
                        </div>
                        <Link
                          href={course.href}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 group/link transition-colors"
                        >
                          Learn More
                          <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/5 group-hover:to-orange-500/5 pointer-events-none transition-colors duration-300" />
                </Card>
              </ScrollReveal>
            )
          })}
        </div>

        <div className="text-center mt-16">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-sm bg-orange-500 text-white hover:bg-orange-600 transition-all duration-200 hover:shadow-lg"
          >
            View All Programmes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
