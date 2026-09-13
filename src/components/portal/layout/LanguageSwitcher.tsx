'use client'

import { useTranslation } from '@/lib/i18n/useTranslation'
import { Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
  compact?: boolean
}

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, isSinhala } = useTranslation()

  return (
    <div
      className={cn(
        'inline-flex items-center bg-slate-100/90 border border-slate-200/80 p-0.5 rounded-xl shadow-2xs',
        className
      )}
      role="group"
      aria-label="Select Language"
    >
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={!isSinhala}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
          !isSinhala
            ? 'bg-white text-orange-600 font-bold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
        title="Switch to English"
      >
        <span className="text-xs">🇬🇧</span>
        <span>{compact ? 'EN' : 'English'}</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('si')}
        aria-pressed={isSinhala}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
          isSinhala
            ? 'bg-white text-orange-600 font-bold shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
        )}
        title="සිංහල භාෂාවට මාරු වන්න"
      >
        <span className="text-xs">🇱🇰</span>
        <span>සිංහල</span>
      </button>
    </div>
  )
}
