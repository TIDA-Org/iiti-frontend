import { apiFetch } from './core'

export type SiteSettingValueType = 'string' | 'number' | 'boolean'

export interface SiteSettingApiResponse {
  id: number
  key: string
  value: string | null
  value_type: SiteSettingValueType
  category: string
  label: string
  is_public: boolean
  updated_at: string
}

export interface SiteSettingsGroupedApiResponse {
  category: string
  settings: SiteSettingApiResponse[]
}

export interface SmsTemplateApiResponse {
  id: number
  event_key: string
  label: string
  template_en: string
  template_si: string | null
  is_active: boolean
  updated_by: string | null
  updated_at: string
}

export interface SmsTemplateUpdatePayload {
  template_en?: string | null
  template_si?: string | null
  is_active?: boolean | null
  label?: string | null
}

export function mapSettingsByKey(settings: SiteSettingApiResponse[]): Record<string, SiteSettingApiResponse> {
  return Object.fromEntries(settings.map((setting) => [setting.key, setting]))
}

export async function apiGetPublicSettings(): Promise<SiteSettingApiResponse[]> {
  return apiFetch('/settings/public')
}

export async function apiGetAllSettings(): Promise<SiteSettingsGroupedApiResponse[]> {
  return apiFetch('/settings/')
}

export async function apiBulkUpdateSettings(settings: Record<string, string>): Promise<SiteSettingApiResponse[]> {
  return apiFetch('/settings/bulk', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  })
}

export async function apiUpdateSetting(key: string, value: string): Promise<SiteSettingApiResponse> {
  return apiFetch(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ value }),
  })
}

export async function apiGetSmsTemplates(): Promise<SmsTemplateApiResponse[]> {
  return apiFetch('/settings/sms-templates')
}

export async function apiGetSmsTemplate(eventKey: string): Promise<SmsTemplateApiResponse> {
  return apiFetch(`/settings/sms-templates/${eventKey}`)
}

export async function apiUpdateSmsTemplate(
  eventKey: string,
  data: SmsTemplateUpdatePayload,
): Promise<SmsTemplateApiResponse> {
  return apiFetch(`/settings/sms-templates/${eventKey}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}