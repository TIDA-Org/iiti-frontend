'use client'

import { useEffect, useState } from 'react'
import { useLanguageStore, type Language } from '@/store/languageStore'
import { en, type Translations } from './translations/en'
import { si } from './translations/si'

const dictionaries: Record<Language, Translations> = {
  en,
  si,
}

export function useTranslation() {
  const { language, setLanguage, toggleLanguage } = useLanguageStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Before mounting on client, default to English to prevent SSR hydration mismatches
  const currentLanguage: Language = mounted ? language : 'en'
  const t = dictionaries[currentLanguage] || en

  return {
    language: currentLanguage,
    setLanguage,
    toggleLanguage,
    t,
    isSinhala: currentLanguage === 'si',
    mounted,
  }
}
