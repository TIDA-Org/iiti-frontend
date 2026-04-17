'use client'

import { createContext, useContext, useMemo } from 'react'

import { useApi } from '@/hooks/useApi'
import { apiGetPublicSettings, SiteSettingApiResponse } from '@/lib/api/settings'
import { buildPublicSiteSettings, PublicSiteSettings } from '@/lib/public-site-settings'

interface PublicSiteSettingsContextValue {
  settings: PublicSiteSettings
  rawSettings: SiteSettingApiResponse[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const PublicSiteSettingsContext = createContext<PublicSiteSettingsContextValue | null>(null)

export function PublicSiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error, refetch } = useApi(apiGetPublicSettings, [])

  const value = useMemo(
    () => ({
      settings: buildPublicSiteSettings(data),
      rawSettings: data || [],
      isLoading,
      error,
      refetch,
    }),
    [data, error, isLoading, refetch],
  )

  return <PublicSiteSettingsContext.Provider value={value}>{children}</PublicSiteSettingsContext.Provider>
}

export function usePublicSiteSettings() {
  const context = useContext(PublicSiteSettingsContext)

  if (!context) {
    throw new Error('usePublicSiteSettings must be used within PublicSiteSettingsProvider')
  }

  return context
}