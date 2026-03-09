import Link from 'next/link'
import { ArrowRight, Clock, Award } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'

const COURSES = [
  {
    title: 'Forklift Operator Training Programme',
    href: '/courses/forklift',
    duration: '4 Weeks',
    description: 'Comprehensive forklift operation training covering safety protocols, load handling, site navigation, and TVEC examination preparation.',
    bgColor: 'from-orange-500 to-orange-600',
    code: 'IITI-FO-001',
  },
  {
    title: 'Excavator Operator Training Programme',
    href: '/courses/excavator',
    duration: '6 Weeks',
    description: 'Master excavator controls, digging techniques, site safety, and heavy earthmoving operations aligned with NVQ Level 3 standards.',
    bgColor: 'from-amber-500 to-amber-600',
    code: 'IITI-EX-002',
  },
  {
    title: 'Backhoe Loader Operator Training Programme',
    href: '/courses/backhoe-loader',
    duration: '5 Weeks',
    description: 'Dual-function machine operation: loader bucket and backhoe techniques, safety compliance, and industry-standard assessment.',
    bgColor: 'from-yellow-500 to-orange-500',
    code: 'IITI-BL-003',
  },
]

export function CoursesPreview() {
  return (
    <section className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center mb-14">
          <SectionLabel className="justify-center">Our Programmes</SectionLabel>
          <h2
            className="text-4xl lg:text-5xl font-extrabold text-stone-900 mb-4"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Industry-Ready Training for
            <br />
            <span className="text-orange-500">Modern Heavy Machinery</span>
          </h2>
          <p className="text-stone-500 max-w-2xl mx-auto leading-relaxed">
            All programmes are TVEC registered and lead to NVQ Level 3 certification — recognized by local and international employers.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {COURSES.map((course, i) => (
            <ScrollReveal key={course.href} delay={i * 0.1}>
              <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-stone-100 hover:border-orange-200 transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col">
                {/* Gradient header */}
                <div className={`h-3 bg-gradient-to-r ${course.bgColor}`} />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
                      NVQ Level 3
                    </span>
                    <span className="text-xs text-stone-400">{course.code}</span>
                  </div>
                  <h3
                    className="text-lg font-bold text-stone-800 mb-3 leading-tight group-hover:text-orange-600 transition-colors"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {course.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed flex-1">{course.description}</p>
                  <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </div>
                    <Link
                      href={course.href}
                      className="flex items-center gap-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
                    >
                      Learn More
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">TVEC Reg</span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">ISO Certified</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-7 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
          >
            View All Programmes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
