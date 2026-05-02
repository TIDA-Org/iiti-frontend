import { SectionLabel } from '@/components/shared/SectionLabel'
import { ScrollReveal } from '@/components/shared/ScrollReveal'
import { apiGetContentSection } from '@/lib/api/website'
import { apiGetPublicSettings, mapSettingsByKey } from '@/lib/api/settings'
import { Award, Users, CheckCircle } from 'lucide-react'

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripHtml(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function parseAboutContent(content: string | null | undefined) {
  if (!content) {
    return {
      title: '',
      paragraphs: [] as string[],
      emphasisLabel: '',
      emphasisItems: [] as string[],
    }
  }

  const titleMatch = content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i)
  const title = stripHtml(titleMatch?.[1] || '')

  const paragraphs = Array.from(content.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi))
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)

  const emphasisItems = Array.from(content.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
    .map((match) => stripHtml(match[1]))
    .filter(Boolean)

  let emphasisLabel = ''
  if (emphasisItems.length > 0 && paragraphs.length > 0 && paragraphs[paragraphs.length - 1].endsWith(':')) {
    emphasisLabel = paragraphs.pop()!.replace(/:$/, '')
  }

  return {
    title,
    paragraphs,
    emphasisLabel,
    emphasisItems,
  }
}

function extractPurposeEntries(content: string | null | undefined) {
  if (!content) return [] as Array<{ title: string; text: string }>

  return Array.from(content.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi)).map((match) => ({
    title: stripHtml(match[1]),
    text: stripHtml(match[2]).replace(/^"|"$/g, ''),
  }))
}

function buildPurposeCards(content: string | null | undefined, localizedContent: string | null | undefined) {
  const englishPurpose = extractPurposeEntries(content)
  const localizedPurpose = extractPurposeEntries(localizedContent)

  return englishPurpose.map((entry, index) => ({
    title: entry.title,
    englishText: entry.text,
    localTitle: localizedPurpose[index]?.title || '',
    localText: localizedPurpose[index]?.text || '',
  }))
}

export default async function AboutPage() {
  const [aboutSection, publicSettings] = await Promise.all([
    apiGetContentSection('about').catch(() => null),
    apiGetPublicSettings().catch(() => []),
  ])

  const settingsMap = mapSettingsByKey(publicSettings)
  const aboutContent = parseAboutContent(aboutSection?.content)
  const purposeCards = buildPurposeCards(aboutSection?.content, aboutSection?.content_si)
  const instituteName = settingsMap.institute_name?.value || ''
  const businessReg = settingsMap.business_reg_number
  const tvecAccreditation = settingsMap.tvec_accreditation
  const isoCertification = settingsMap.iso_certification
  const yearEstablished = settingsMap.year_established?.value || ''
  const heroEyebrow = aboutSection?.title || instituteName
  const heroTitle = aboutContent.title
  const heroDescription = aboutSection?.meta_description || aboutContent.paragraphs[0] || ''
  const purposeHeading = purposeCards.map((card) => card.title).filter(Boolean).join(' & ')
  const settingsCards = [businessReg, tvecAccreditation, isoCertification].filter(Boolean)

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to-br from-stone-900 to-stone-800 py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            {heroEyebrow ? <SectionLabel light className="justify-center">{heroEyebrow}</SectionLabel> : null}
            {heroTitle ? (
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
                {heroTitle}
              </h1>
            ) : null}
            {heroDescription ? (
              <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                {heroDescription}
              </p>
            ) : null}
          </ScrollReveal>
        </div>
      </section>

      {/* Vision & Mission */}
      {purposeCards.length > 0 ? (
        <section className="py-20 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4">
            <ScrollReveal className="text-center mb-12">
              {heroEyebrow ? <SectionLabel className="justify-center">{heroEyebrow}</SectionLabel> : null}
              {purposeHeading ? <h2 className="text-3xl font-bold text-stone-900 leading-tight tracking-tight">{purposeHeading}</h2> : null}
            </ScrollReveal>
            <div className="grid md:grid-cols-2 gap-8">
              {purposeCards.map((card, index) => (
                <ScrollReveal key={`${card.title}-${index}`} delay={index * 0.1}>
                  <div className="bg-white rounded-2xl p-8 border border-stone-200 h-full">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                      {index === 0 ? <Award className="w-6 h-6 text-orange-500" /> : <Users className="w-6 h-6 text-orange-500" />}
                    </div>
                    {card.title ? <h3 className="text-xl font-bold text-stone-800 mb-4 leading-tight tracking-tight">{card.title}</h3> : null}
                    {card.localText ? (
                      <p className="text-stone-600 text-sm leading-relaxed mb-4 font-sinhala" lang="si">
                        {card.localText}
                      </p>
                    ) : null}
                    {card.englishText ? (
                      <p className="text-stone-500 text-sm leading-relaxed italic border-t border-stone-100 pt-4">
                        &quot;{card.englishText}&quot;
                      </p>
                    ) : null}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Timeline */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-orange-50 via-amber-50/60 to-transparent" />
        <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-orange-100/50 blur-3xl" />
        <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-stone-200/50 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4">
          <ScrollReveal className="text-center mb-12">
            {aboutSection?.title ? <SectionLabel className="justify-center">{aboutSection.title}</SectionLabel> : null}
            {aboutContent.title ? <h2 className="text-3xl font-bold text-stone-900 leading-tight tracking-tight">{aboutContent.title}</h2> : null}
          </ScrollReveal>
          <ScrollReveal>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.4fr]">
              <div className="relative overflow-hidden rounded-4xl border border-stone-200 bg-stone-900 p-8 text-white shadow-[0_30px_80px_-40px_rgba(28,25,23,0.8)] sm:p-10">
                <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-orange-500/20 blur-2xl" />
                <div className="absolute bottom-0 left-0 h-28 w-28 -translate-x-8 translate-y-8 rounded-full bg-white/10 blur-2xl" />

                <div className="relative">
                  <div className="mb-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur">
                    <CheckCircle className="h-7 w-7 text-orange-400" />
                  </div>

                  {instituteName ? <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">{instituteName}</p> : null}
                  {aboutSection?.title ? <h3 className="mt-3 text-3xl font-bold leading-tight tracking-tight">{aboutSection.title}</h3> : null}
                  {heroDescription ? <p className="mt-4 max-w-md text-sm leading-7 text-stone-300">{heroDescription}</p> : null}

                  {yearEstablished || settingsCards.length > 0 ? (
                    <div className="mt-10 space-y-4">
                      {yearEstablished ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-400">{settingsMap.year_established?.label}</p>
                          <p className="mt-2 text-lg font-bold text-white">{yearEstablished}</p>
                        </div>
                      ) : null}
                      <div className="grid gap-4 md:grid-cols-2">
                        {settingsCards.map((setting) => (
                          <div key={setting.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-400">{setting.label}</p>
                            <p className="mt-2 text-sm font-semibold text-white">{setting.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="relative rounded-4xl border border-stone-200 bg-white p-8 shadow-[0_24px_80px_-48px_rgba(28,25,23,0.35)] sm:p-10">
                <div className="absolute left-0 top-10 bottom-10 w-px bg-linear-to-b from-transparent via-orange-200 to-transparent" />
                {aboutSection?.title ? (
                  <div className="mb-8 flex items-center gap-4 pl-6">
                    <div className="h-3 w-3 rounded-full bg-orange-500 shadow-[0_0_0_6px_rgba(249,115,22,0.12)]" />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">{aboutSection.title}</p>
                    </div>
                  </div>
                ) : null}

                <div className="pl-6">
                  {aboutContent.title ? <h3 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-stone-900">{aboutContent.title}</h3> : null}

                  <div className="mt-8 space-y-6">
                    {aboutContent.paragraphs.map((paragraph, index) => (
                      <p
                        key={`${paragraph}-${index}`}
                        className={index === 0
                          ? 'text-base leading-8 text-stone-700 text-justify sm:text-[1.02rem]'
                          : 'text-[0.98rem] leading-8 text-stone-600 text-justify sm:text-base'}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {aboutContent.emphasisLabel || aboutContent.emphasisItems.length > 0 ? (
                    <div className="mt-10 rounded-[1.75rem] border border-orange-100 bg-linear-to-br from-orange-50 via-white to-stone-50 p-6 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-[0_16px_32px_-18px_rgba(249,115,22,0.8)]">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        {aboutSection?.title ? <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">{aboutSection.title}</p> : null}
                        {aboutContent.emphasisLabel ? <h4 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-stone-900">{aboutContent.emphasisLabel}</h4> : null}
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {aboutContent.emphasisItems.map((item, index) => (
                        <div
                          key={`${item}-${index}`}
                          className="flex min-h-16 items-start gap-3 rounded-2xl border border-stone-200/80 bg-white/90 px-4 py-4 shadow-[0_16px_30px_-26px_rgba(28,25,23,0.5)]"
                        >
                          <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-orange-500" />
                          <p className="text-[0.98rem] leading-7 text-stone-700">{item}</p>
                        </div>
                      ))}
                    </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}
