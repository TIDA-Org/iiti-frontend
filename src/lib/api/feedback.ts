import { apiFetch } from './core'

export type FeedbackType = 'feedback' | 'complaint'
export type FeedbackStatus = 'pending' | 'reviewing' | 'resolved' | 'closed'

export interface FeedbackComplaint {
  id: string
  student_id: string
  type: FeedbackType
  category: string
  subject: string
  description: string
  is_anonymous: boolean
  status: FeedbackStatus
  admin_response?: string
  admin_responded_at?: string
  attachment_path?: string
  attachment_original_name?: string
  created_at: string
  updated_at: string
}

export interface FeedbackComplaintDetail extends FeedbackComplaint {
  student?: {
    id: string
    student_number: string
    full_name: string
    email: string
  }
}

export interface CreateFeedbackPayload {
  type: FeedbackType
  category: string
  subject: string
  description: string
  is_anonymous: boolean
}

export interface UpdateStatusPayload {
  status: FeedbackStatus
}

export interface AdminResponsePayload {
  admin_response: string
  status?: FeedbackStatus
}

// Submit feedback/complaint
export const apiCreateFeedback = async (data: CreateFeedbackPayload): Promise<FeedbackComplaint> => {
  return apiFetch('/feedback-complaints', { method: 'POST', body: JSON.stringify(data) })
}

// Get my feedback (student)
export const apiGetMyFeedback = async (): Promise<FeedbackComplaint[]> => {
  return apiFetch('/feedback-complaints/me', { method: 'GET' })
}

// Get all feedback (admin)
export const apiGetAllFeedback = async (feedback_type?: FeedbackType, status?: FeedbackStatus): Promise<FeedbackComplaint[]> => {
  const params = new URLSearchParams()
  if (feedback_type) params.append('feedback_type', feedback_type)
  if (status) params.append('status', status)
  const queryString = params.toString()
  return apiFetch(`/feedback-complaints${queryString ? '?' + queryString : ''}`, { method: 'GET' })
}

// Get feedback detail
export const apiGetFeedbackDetail = async (id: string): Promise<FeedbackComplaintDetail> => {
  return apiFetch(`/feedback-complaints/${id}`, { method: 'GET' })
}

// Update feedback status (admin)
export const apiUpdateFeedbackStatus = async (id: string, payload: UpdateStatusPayload): Promise<FeedbackComplaint> => {
  return apiFetch(`/feedback-complaints/${id}/status`, { method: 'PUT', body: JSON.stringify(payload) })
}

// Add admin response (admin)
export const apiAddAdminResponse = async (id: string, payload: AdminResponsePayload): Promise<FeedbackComplaint> => {
  return apiFetch(`/feedback-complaints/${id}/response`, { method: 'POST', body: JSON.stringify(payload) })
}
