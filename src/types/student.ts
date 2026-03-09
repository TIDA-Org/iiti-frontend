import { Status } from './common'

export interface Student {
  id: string
  studentId: string
  fullName: string
  nameWithInitials: string
  nic: string
  dateOfBirth: string
  gender: 'male' | 'female'
  phone: string
  secondaryPhone?: string
  email: string
  addressLine1: string
  addressLine2?: string
  city: string
  district: string
  province: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  photo?: string
  status: Status
  createdAt: string
  updatedAt: string
}
