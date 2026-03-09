import { Role } from './common'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  studentId?: string
  avatar?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}
