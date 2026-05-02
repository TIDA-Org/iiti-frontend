'use client'

import { useEffect, useMemo, useState } from 'react'
import { Globe2, Lock, RotateCcw, Save } from 'lucide-react'
import { toast } from 'sonner'

import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useApi } from '@/hooks/useApi'
import { apiBulkUpdateSettings, apiGetAllSettings, apiGetPublicSettings, SiteSettingApiResponse } from '@/lib/api/settings'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const SETTINGS_CACHE_KEY = 'iiti-admin-settings-cache-v1'

const CATEGORY_COPY: Record<string, string> = {
  general: 'Public institute identity, contact details, and core profile values used across the platform.',
  payment: 'Bank details and fee-related defaults used by enrollments, receipts, and public payment instructions.',
  sms: 'Global SMS gateway switches and sender defaults used by background notification tasks.',
  social: 'Public social and map links surfaced on the website and contact experiences.',
  documents: 'Internal prefixes and verification settings used for generated records and document numbering.',
}

function buildDraftMap(groups: { settings: SiteSettingApiResponse[] }[]) {
  return Object.fromEntries(
    groups.flatMap((group) => group.settings.map((setting) => [setting.key, setting.value ?? ''])),
  )
}

function groupSettingsByCategory(settings: SiteSettingApiResponse[]) {
  const grouped = new Map<string, SiteSettingApiResponse[]>()
  settings.forEach((setting) => {
    const category = setting.category || 'general'
    if (!grouped.has(category)) grouped.set(category, [])
    grouped.get(category)?.push(setting)
  })

  return Array.from(grouped.entries()).map(([category, groupedSettings]) => ({
    category,
    settings: groupedSettings,
  }))
}

function formatCategoryLabel(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1)
}

function shouldUseTextarea(setting: SiteSettingApiResponse) {
  return setting.key.includes('address') || setting.key.includes('maps') || (setting.value?.length || 0) > 90
}

export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useApi(apiGetAllSettings, [])
  const [cachedData, setCachedData] = useState<ReturnType<typeof apiGetAllSettings> extends Promise<infer T> ? T | null : null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [selectedCategory, setSelectedCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const canEdit = user?.role === 'super_admin'

  const groups = data || cachedData

  const initialSettings = useMemo(() => (groups ? buildDraftMap(groups) : {}), [groups])
  const categories = useMemo(() => groups?.map((group) => group.category) || [], [groups])
  const currentGroup = useMemo(
    () => groups?.find((group) => group.category === selectedCategory) || groups?.[0] || null,
    [groups, selectedCategory],
  )
  const changedSettings = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(drafts).filter(([key, value]) => (initialSettings[key] ?? '') !== value),
      ),
    [drafts, initialSettings],
  )
  const dirtyCount = Object.keys(changedSettings).length

  useEffect(() => {
    if (!groups) return
    setDrafts(buildDraftMap(groups))
    setSelectedCategory((current) => {
      if (current && groups.some((group) => group.category === current)) {
        return current
      }
      return groups[0]?.category || ''
    })
  }, [groups])

  useEffect(() => {
    if (!data || typeof window === 'undefined') return
    window.localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data))
    setCachedData(data)
  }, [data])

  useEffect(() => {
    if (data || !error || typeof window === 'undefined') return
    const cached = window.localStorage.getItem(SETTINGS_CACHE_KEY)
    if (!cached) return

    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed)) {
        setCachedData(parsed)
      }
    } catch {
      // Ignore malformed cache; live API remains source of truth.
    }
  }, [data, error])

  useEffect(() => {
    if (data || cachedData || !error) return

    let cancelled = false
    ;(async () => {
      try {
        const publicSettings = await apiGetPublicSettings()
        if (cancelled || publicSettings.length === 0) return
        const groupedPublic = groupSettingsByCategory(publicSettings)
        setCachedData(groupedPublic)
      } catch {
        // Keep existing error state when fallback cannot load.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [cachedData, data, error])

  function updateDraft(key: string, value: string) {
    setDrafts((current) => ({ ...current, [key]: value }))
  }

  function resetDrafts() {
    setDrafts(initialSettings)
  }

  async function handleSaveAll() {
    if (!canEdit) {
      toast.error('Only Super Admin can edit settings.')
      return
    }

    if (dirtyCount === 0) {
      toast.info('No setting changes to save.')
      return
    }

    setSaving(true)
    try {
      await apiBulkUpdateSettings(changedSettings)
      toast.success(`Saved ${dirtyCount} setting${dirtyCount === 1 ? '' : 's'}.`)
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Live institute configuration from the backend settings module"
        actions={
          <>
            <Button variant="outline" onClick={resetDrafts} disabled={saving || dirtyCount === 0}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={handleSaveAll} disabled={saving || dirtyCount === 0 || !canEdit}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : `Save Changes${dirtyCount > 0 ? ` (${dirtyCount})` : ''}`}
            </Button>
          </>
        }
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Site Settings</h2>
            <p className="mt-1 text-sm text-slate-500">
              Admins can review all settings. Super Admin can update values and push them to the backend with one bulk save.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {canEdit ? 'Editing enabled for Super Admin.' : 'Read-only mode. Your role can view but cannot edit.'}
          </div>
        </div>
      </div>

      {error && groups && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Live settings could not be refreshed. Showing the most recent cached data.
        </div>
      )}

      <DataLoader isLoading={isLoading} error={groups ? null : error} onRetry={refetch}>
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
            No site settings were returned by the backend.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="space-y-1">
                {categories.map((category) => {
                  const isActive = category === currentGroup?.category
                  const count = groups?.find((group) => group.category === category)?.settings.length || 0

                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                        isActive
                          ? 'border-orange-200 bg-orange-50 text-orange-700'
                          : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50',
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{formatCategoryLabel(category)}</span>
                        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500 ring-1 ring-slate-200">
                          {count}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{CATEGORY_COPY[category] || 'Settings group from backend configuration.'}</p>
                    </button>
                  )
                })}
              </div>
            </aside>

            {currentGroup && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{formatCategoryLabel(currentGroup.category)}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {CATEGORY_COPY[currentGroup.category] || 'Update the values in this configuration group.'}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">{currentGroup.settings.length} settings in this category</div>
                </div>

                <div className="space-y-4">
                  {currentGroup.settings.map((setting) => {
                    const currentValue = drafts[setting.key] ?? ''
                    const isDirty = currentValue !== (initialSettings[setting.key] ?? '')

                    return (
                      <div key={setting.key} className={cn('rounded-2xl border p-4 transition-colors', isDirty ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-slate-50/40')}>
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="max-w-xl">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-medium text-slate-800">{setting.label}</h4>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                                {setting.value_type}
                              </span>
                              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', setting.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600')}>
                                {setting.is_public ? <Globe2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                {setting.is_public ? 'Public' : 'Internal'}
                              </span>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">Key: {setting.key}</p>
                          </div>

                          <div className="w-full lg:max-w-md">
                            {setting.value_type === 'boolean' ? (
                              <label className={cn('flex items-center justify-between rounded-xl border px-4 py-3 text-sm', canEdit ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-100')}>
                                <span className="text-slate-600">
                                  {currentValue === 'true' ? 'Enabled' : 'Disabled'}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={currentValue === 'true'}
                                  disabled={!canEdit}
                                  onChange={(event) => updateDraft(setting.key, event.target.checked ? 'true' : 'false')}
                                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                                />
                              </label>
                            ) : shouldUseTextarea(setting) ? (
                              <Textarea
                                value={currentValue}
                                disabled={!canEdit}
                                rows={4}
                                onChange={(event) => updateDraft(setting.key, event.target.value)}
                                placeholder={`Enter ${setting.label.toLowerCase()}`}
                                className="bg-white"
                              />
                            ) : (
                              <Input
                                type={setting.value_type === 'number' ? 'number' : 'text'}
                                value={currentValue}
                                disabled={!canEdit}
                                onChange={(event) => updateDraft(setting.key, event.target.value)}
                                placeholder={`Enter ${setting.label.toLowerCase()}`}
                                className="bg-white"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </DataLoader>
    </div>
  )
}
