import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'si'

interface LanguageState {
  language: Language
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({ language: state.language === 'en' ? 'si' : 'en' })),
    }),
    {
      name: 'iiti-portal-language',
    }
  )
)
