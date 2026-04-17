import { INSTITUTE_INFO } from '@/lib/constants'
import { mapSettingsByKey, SiteSettingApiResponse } from '@/lib/api/settings'

export interface PublicSiteSettings {
  instituteName: string
  instituteNameSi: string
  businessRegNumber: string
  tvecAccreditation: string
  isoCertification: string
  contactPhone: string
  mobilePhone: string
  contactEmail: string
  contactAddress: string
  googleMapsUrl: string
  facebookUrl: string
  youtubeUrl: string
  whatsappNumber: string
  tagline: string
}

const DEFAULT_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.9!2d79.9!3d6.84!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTAnMjQuMCJOIDc5wrA1NCcwMC4wIkU!5e0!3m2!1sen!2slk!4v1'

function getNonEmptyValue(value: string | null | undefined, fallback: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

export function buildPublicSiteSettings(settings: SiteSettingApiResponse[] | null | undefined): PublicSiteSettings {
  const settingsByKey = mapSettingsByKey(settings || [])

  const whatsappNumber = (settingsByKey.whatsapp_number?.value || '').trim()

  return {
    instituteName: getNonEmptyValue(settingsByKey.institute_name?.value, INSTITUTE_INFO.fullName),
    instituteNameSi: getNonEmptyValue(settingsByKey.institute_name_si?.value, INSTITUTE_INFO.fullName),
    businessRegNumber: getNonEmptyValue(settingsByKey.business_reg_number?.value, INSTITUTE_INFO.tvecRegNo),
    tvecAccreditation: getNonEmptyValue(settingsByKey.tvec_accreditation?.value, INSTITUTE_INFO.tvecRegNo),
    isoCertification: getNonEmptyValue(settingsByKey.iso_certification?.value, INSTITUTE_INFO.isoNumber),
    contactPhone: getNonEmptyValue(settingsByKey.contact_phone?.value, INSTITUTE_INFO.telephone),
    mobilePhone: whatsappNumber,
    contactEmail: getNonEmptyValue(settingsByKey.contact_email?.value, INSTITUTE_INFO.email),
    contactAddress: getNonEmptyValue(settingsByKey.contact_address?.value, INSTITUTE_INFO.address),
    googleMapsUrl: getNonEmptyValue(settingsByKey.google_maps_url?.value, DEFAULT_MAP_EMBED_URL),
    facebookUrl: getNonEmptyValue(settingsByKey.facebook_url?.value, ''),
    youtubeUrl: getNonEmptyValue(settingsByKey.youtube_url?.value, ''),
    whatsappNumber,
    tagline: INSTITUTE_INFO.tagline,
  }
}