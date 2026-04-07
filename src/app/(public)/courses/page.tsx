import Link from 'next/link'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { COURSES } from '@/lib/data/courses'
import { ArrowRight, Clock, Award, CheckCircle } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div>
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4 text-center">
        <ScrollReveal>
          <SectionLabel light className="justify-center">Our Programmes</SectionLabel>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            NVQ Level 3 Training Programmes
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto">
            All courses are TVEC-registered and lead to nationally and internationally recognized NVQ Level 3 certification.
          </p>
        </ScrollReveal>
      </section>

      <section className="py-20 bg-stone-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid gap-8">
            {COURSES.map((course, i) => (
              <ScrollReveal key={course.id} delay={i * 0.1}>
                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="h-2 bg-linear-to-r from-orange-500 to-amber-500" />
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">NVQ Level 3</span>
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">TVEC Registered</span>
                          <span className="text-xs text-stone-400">{course.code}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800 mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.name}</h2>
                        <p className="text-stone-500 leading-relaxed mb-4">{course.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-orange-400" />Duration: {course.duration}</span>
                        </div>
                        <div className="mt-4 space-y-1.5">
                          {['Institute Certificate', 'Skill ID Card', 'NVQ Level 3 Certificate'].map(c => (
                            <div key={c} className="flex items-center gap-2 text-sm text-stone-600">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 min-w-45">
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                          <p className="text-xs text-stone-400 mb-1">Course Fee</p>
                          <p className="text-2xl font-extrabold text-orange-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            LKR {course.fee.toLocaleString()}
                          </p>
                        </div>
                        <Link
                          href={`/courses/${course.slug}`}
                          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors"
                        >
                          Learn More <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                          href="/apply"
                          className="flex items-center justify-center gap-2 border border-orange-300 text-orange-600 hover:bg-orange-50 py-3 rounded-xl font-semibold text-sm transition-colors"
                        >
                          Apply Now
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
