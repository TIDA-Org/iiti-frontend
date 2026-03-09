import { Certificate } from '@/types/certificate'

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    id: 'cert1', certificateNo: 'IITI-CERT-2024-001', studentId: 's6', courseId: 'c1',
    resultId: 'r1', type: 'institute', issuedAt: '2024-07-28T00:00:00Z',
    verifyToken: 'VERIFY-2024-ABC123', isRevoked: false,
  },
  {
    id: 'cert2', certificateNo: 'IITI-CERT-2024-002', studentId: 's6', courseId: 'c1',
    resultId: 'r1', type: 'skill_id', issuedAt: '2024-07-28T00:00:00Z',
    verifyToken: 'VERIFY-2024-DEF456', isRevoked: false,
  },
  {
    id: 'cert3', certificateNo: 'IITI-CERT-2024-003', studentId: 's7', courseId: 'c3',
    resultId: 'r2', type: 'institute', issuedAt: '2024-09-15T00:00:00Z',
    verifyToken: 'VERIFY-2024-GHI789', isRevoked: false,
  },
]
