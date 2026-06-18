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

export interface AccreditationDocumentLink {
  label: string
  object_key: string | null
  original_name: string | null
  url: string | null
}

export interface AccreditationDocumentsResponse {
  tvec_documents: AccreditationDocumentLink[]
  iso_document: AccreditationDocumentLink
  iaf_url: string
}

export interface AccreditationDocumentsUpdateResponse {
  message: string
  updated_keys: string[]
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

export async function apiGetPublicAccreditationDocuments(): Promise<AccreditationDocumentsResponse> {
  return apiFetch('/settings/public/accreditation-documents')
}

export async function apiGetAdminAccreditationDocuments(): Promise<AccreditationDocumentsResponse> {
  return apiFetch('/settings/accreditation-documents')
}

export async function apiUpdateAccreditationDocuments(payload: {
  iafUrl?: string
  tvecDoc1?: File | null
  tvecDoc2?: File | null
  isoDoc?: File | null
}): Promise<AccreditationDocumentsUpdateResponse> {
  const formData = new FormData()

  if (payload.iafUrl !== undefined) {
    formData.append('iaf_url', payload.iafUrl)
  }
  if (payload.tvecDoc1) {
    formData.append('tvec_doc_1', payload.tvecDoc1)
  }
  if (payload.tvecDoc2) {
    formData.append('tvec_doc_2', payload.tvecDoc2)
  }
  if (payload.isoDoc) {
    formData.append('iso_doc', payload.isoDoc)
  }

  return apiFetch('/settings/accreditation-documents', {
    method: 'PUT',
    body: formData,
  })
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