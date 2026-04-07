import Link from 'next/link'
import { Course, CourseOutlineWeek } from '@/types/course'
import { CheckCircle, Clock, Award, CreditCard, GraduationCap, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { SectionLabel } from '@/components/shared/SectionLabel'

interface CourseDetailContentProps {
  course: Course
  outline: CourseOutlineWeek[]
}

export function CourseDetailContent({ course, outline }: CourseDetailContentProps) {
  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
            <Link href="/" className="hover:text-orange-400">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/courses" className="hover:text-orange-400">Courses</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{course.name.split(' ').slice(0, 2).join(' ')}</span>
          </div>
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">NVQ Level {course.nvqLevel}</span>
              <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">TVEC Registered</span>
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">ISO Certified</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {course.name}
            </h1>
            <p className="text-stone-300 text-lg max-w-2xl leading-relaxed">{course.description}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left - 2/3 */}
            <div className="lg:col-span-2 space-y-10">
              {/* What you'll learn */}
              <ScrollReveal>
                <SectionLabel>Curriculum</SectionLabel>
                <h2 className="text-2xl font-bold text-stone-800 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Week-by-Week Training Plan</h2>
                <div className="space-y-4">
                  {outline.map((week) => (
                    <div key={week.week} className="bg-white rounded-xl border border-stone-100 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">
                          {week.week}
                        </div>
                        <h4 className="font-semibold text-stone-800">Week {week.week}: {week.title}</h4>
                      </div>
                      <ul className="grid sm:grid-cols-2 gap-1.5">
                        {week.topics.map((topic) => (
                          <li key={topic} className="flex items-center gap-2 text-sm text-stone-600">
                            <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            {topic}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* Certificates */}
              <ScrollReveal>
                <h2 className="text-2xl font-bold text-stone-800 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Certificates You Receive</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { icon: Award, label: 'Institute Certificate', desc: 'Officially issued by IITI' },
                    { icon: CreditCard, label: 'Skill ID Card', desc: 'QR-verified skill card' },
                    { icon: GraduationCap, label: 'NVQ Level 3', desc: 'Issued by TVEC' },
                  ].map((cert) => {
                    const Icon = cert.icon
                    return (
                      <div key={cert.label} className="bg-white rounded-xl border border-stone-100 p-5 text-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Icon className="w-5 h-5 text-orange-500" />
                        </div>
                        <h4 className="font-semibold text-stone-800 text-sm mb-1">{cert.label}</h4>
                        <p className="text-xs text-stone-400">{cert.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </ScrollReveal>
            </div>

            {/* Right sticky sidebar */}
            <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
              <ScrollReveal>
                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-md">
                  <h3 className="font-bold text-stone-800 mb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>{course.name}</h3>
                  <div className="space-y-3 mb-5 text-sm">
                    <div className="flex justify-between"><span className="text-stone-400">Duration</span><span className="font-medium text-stone-700">{course.duration}</span></div>
                    <div className="flex justify-between"><span className="text-stone-400">NVQ Level</span><span className="font-medium text-stone-700">Level {course.nvqLevel}</span></div>
                    <div className="flex justify-between"><span className="text-stone-400">Course Code</span><span className="font-mono text-xs text-stone-500">{course.code}</span></div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 mb-5">
                    <p className="text-xs text-stone-400 mb-1">Course Fee</p>
                    <p className="text-3xl font-extrabold text-orange-600">LKR {course.fee.toLocaleString()}</p>
                    <p className="text-xs text-stone-400 mt-1">Installment plans available</p>
                  </div>
                  <div className="space-y-2">
                    <Link href="/apply" className="block w-full text-center bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                      Apply for This Course
                    </Link>
                    <Link href="/contact" className="block w-full text-center border border-stone-200 text-stone-600 hover:border-stone-300 py-3 rounded-xl font-semibold text-sm transition-colors">
                      Ask a Question
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">TVEC Reg</span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">ISO Certified</span>
                    <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded">NVQ L3</span>
                  </div>
                </div>
              </ScrollReveal>
              <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                <p className="text-xs font-semibold text-orange-700 mb-2">Bank Payment Details</p>
                <div className="space-y-1 text-xs text-stone-600">
                  <p><span className="text-stone-400">Bank:</span> Bank of Ceylon</p>
                  <p><span className="text-stone-400">Branch:</span> Pannipitiya</p>
                  <p><span className="text-stone-400">Account:</span> IITI Training Centre</p>
                  <p className="text-xs text-stone-400 mt-2">Use your full name as reference</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
