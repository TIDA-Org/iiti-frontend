import { CertificateType } from './common'

export interface Certificate {
  id: string
  certificateNo: string
  studentId: string
  courseId: string
  resultId: string
  type: CertificateType
  issuedAt: string
  expiresAt?: string
  verifyToken: string
  isRevoked: boolean
  revokedAt?: string
  revokedReason?: string
}
