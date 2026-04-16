"use client"

import { useEffect, useState } from 'react'
import { Award, Users, Briefcase, FileCheck, Building, Clock } from 'lucide-react'
import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { Card } from '@/components/ui/card'

const CARD_IMAGES = [
  {
    src: '/images/cards/DSC07552.jpg',
    alt: 'Heavy vehicle training session',
    eyebrow: 'On-site Training',
    title: 'Real Machines. Real Yard. Real Experience.',
    description: 'Practical heavy vehicle instruction with real equipment, real yards, and industry-ready coaching.',
  },
  {
    src: '/images/cards/DSC07639.jpg',
    alt: 'Students during operator training',
    eyebrow: 'Industry Focused',
    title: 'Training Built for Employability',
    description: 'Built for certification, confident machine handling, and smoother transitions into local and overseas jobs.',
  },
]

const FEATURES = [
  { icon: Award, title: 'TVEC & ISO 9001:2015 Accredited Training', desc: 'Nationally recognized certifications meeting international quality standards.' },
  { icon: Users, title: 'Experienced Certified Instructors', desc: 'Learn from industry professionals with years of hands-on experience.' },
  { icon: Briefcase, title: '100% Job Placement Assistance', desc: 'We connect graduates with leading employers locally and internationally.' },
  { icon: FileCheck, title: 'NVQ Level 3 Internationally Recognized Certificate', desc: 'Your qualification is valued by employers across the GCC and beyond.' },
  { icon: Building, title: 'Modern Training Facility in Pannipitiya', desc: 'State-of-the-art equipment and training grounds for practical learning.' },
  { icon: Clock, title: 'Flexible Intake Schedules', desc: 'Multiple batch start dates throughout the year to fit your schedule.' },
]

export function WhyChooseUs() {
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % CARD_IMAGES.length)
    }, 4000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <section className="py-28 bg-linear-to-b from-white via-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <ScrollReveal direction="left">
            <div className="relative">
              <Card className="aspect-4/3 overflow-hidden border-0 bg-slate-950 shadow-lg">
                <div className="relative h-full overflow-hidden rounded-[1.75rem] bg-slate-950 p-3 sm:p-4">
                  <div className="relative h-full overflow-hidden rounded-[1.35rem] bg-slate-900">
                    {CARD_IMAGES.map((image, index) => (
                      <div
                        key={image.src}
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          index === activeImageIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-slate-950/88 via-slate-950/22 to-slate-950/10" />
                      </div>
                    ))}

                    <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur-sm sm:left-6 sm:top-6">
                      {CARD_IMAGES[activeImageIndex].eyebrow}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <div className="max-w-md">
                        <div className="text-3xl font-bold tracking-tight text-white sm:text-4xl">IITI</div>
                        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80 font-regular sm:text-[15px]">
                          {CARD_IMAGES[activeImageIndex].description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <div className="text-lg font-semibold leading-tight text-white sm:text-xl">
                            {CARD_IMAGES[activeImageIndex].title}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          {CARD_IMAGES.map((image, index) => (
                            <button
                              key={image.src}
                              onClick={() => setActiveImageIndex(index)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                index === activeImageIndex
                                  ? 'w-8 bg-orange-500'
                                  : 'w-2 bg-white/40 hover:bg-white/60'
                              }`}
                              aria-label={`Show image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
