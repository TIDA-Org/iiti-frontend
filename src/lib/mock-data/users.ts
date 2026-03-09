import { User } from '@/types/user'

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Thisal Lochana',
    email: 'director@iiti.lk',
    role: 'super_admin',
    isActive: true,
    createdAt: '2020-01-01T00:00:00Z',
    lastLogin: '2025-03-07T09:00:00Z',
    avatar: null,
  },
  {
    id: '2',
    name: 'Dinuka Praveenjaya',
    email: 'manager@iiti.lk',
    role: 'admin',
    isActive: true,
    createdAt: '2021-03-15T00:00:00Z',
    lastLogin: '2025-03-07T08:30:00Z',
    avatar: null,
  },
  {
    id: '3',
    name: 'Madhuja Delgoda',
    email: 'reception@iiti.lk',
    role: 'front_desk',
    isActive: true,
    createdAt: '2022-06-10T00:00:00Z',
    lastLogin: '2025-03-06T17:00:00Z',
    avatar: null,
  },
  {
    id: '4',
    name: 'Maheesh Theekshana',
    email: 'student@iiti.lk',
    role: 'student',
    studentId: 'IITI-2025-0001',
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    lastLogin: '2025-03-07T10:00:00Z',
    avatar: null,
  },
]

export const MOCK_CREDENTIALS: Record<string, string> = {
  'director@iiti.lk': 'SuperAdmin@123',
  'manager@iiti.lk': 'Admin@123',
  'reception@iiti.lk': 'FrontDesk@123',
  'student@iiti.lk': 'Student@123',
}
