'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Languages } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { cn } from '@/lib/utils'
import {
  COURSE_COPY,
  COURSE_LANGUAGE_QUERY_PARAM,
  COURSE_LANGUAGE_STORAGE_KEY,
  isCourseLanguage,
  type CourseLanguage,
} from '@/lib/public-course-language'

interface CourseLanguageContextValue {
  lang: CourseLanguage
  setLang: (lang: CourseLanguage) => void
  copy: (typeof COURSE_COPY)[CourseLanguage]
}

const CourseLanguageContext = createContext<CourseLanguageContextValue | null>(null)

export function CourseLanguageProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [preferredLang, setPreferredLang] = useState<CourseLanguage>(() => {
    if (typeof window === 'undefined') {
      return 'en'
    }

    const savedValue = window.localStorage.getItem(COURSE_LANGUAGE_STORAGE_KEY)
    return isCourseLanguage(savedValue) ? savedValue : 'en'
  })

  const queryLang = useMemo(() => {
    const queryValue = searchParams.get(COURSE_LANGUAGE_QUERY_PARAM)
    return isCourseLanguage(queryValue) ? queryValue : null
  }, [searchParams])

  const lang = queryLang ?? preferredLang

  const setLang = useCallback((nextLang: CourseLanguage) => {
    setPreferredLang(nextLang)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(COURSE_LANGUAGE_STORAGE_KEY, lang)
    }
  }, [lang])

  useEffect(() => {
    const currentValue = searchParams.get(COURSE_LANGUAGE_QUERY_PARAM)
    const expectedValue = lang === 'en' ? null : lang
    if ((currentValue || null) === expectedValue) {
      return
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    if (expectedValue) {
      nextParams.set(COURSE_LANGUAGE_QUERY_PARAM, expectedValue)
    } else {
      nextParams.delete(COURSE_LANGUAGE_QUERY_PARAM)
    }

    const query = nextParams.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [lang, pathname, router, searchParams])

  const value = useMemo<CourseLanguageContextValue>(
    () => ({ lang, setLang, copy: COURSE_COPY[lang] }),
    [lang, setLang],
  )

  return <CourseLanguageContext.Provider value={value}>{children}</CourseLanguageContext.Provider>
}

export function useCourseLanguage() {
  const context = useContext(CourseLanguageContext)
  if (!context) {
    throw new Error('useCourseLanguage must be used within CourseLanguageProvider')
  }

  return context
}

export function CourseLanguageSwitch({ className }: { className?: string }) {
  const { lang, setLang, copy } = useCourseLanguage()

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5', className)}>
      <span className={cn('text-xs font-medium text-stone-500', lang === 'si' && 'font-sinhala')} lang={lang === 'si' ? 'si' : undefined}>
        {copy.language}
      </span>
      {([
        ['en', 'EN'],
        ['si', 'සිං'],
      ] as const).map(([value, label]) => {
        const active = value === lang
        return (
          <button
            key={value}
            type="button"
            onClick={() => setLang(value)}
            className={cn(
              'rounded px-2 py-0.5 text-xs font-semibold transition-colors',
              active ? 'bg-orange-500 text-white' : 'text-stone-600 hover:bg-stone-100',
              value === 'si' && 'font-sinhala',
            )}
            aria-pressed={active}
          >
            {label}
          </button>
        )
      })}
      <div className="ml-1 flex h-5 w-5 items-center justify-center text-stone-500">
        <Languages className="h-3.5 w-3.5" />
      </div>
    </div>
  )
}
