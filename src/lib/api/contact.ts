import { apiFetch } from './core'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface ContactFormResponse {
  success: boolean
  message: string
}

export async function apiSendContactForm(data: ContactFormData): Promise<ContactFormResponse> {
  return apiFetch('/contact/send-message', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
