import { Role } from './common'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  studentId?: string
  isActive: boolean
  createdAt: string
  lastLogin?: string
  avatar?: string | null
}
