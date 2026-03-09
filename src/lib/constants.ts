export const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

export const PROVINCES = [
  'Central Province',
  'Eastern Province',
  'North Central Province',
  'North Western Province',
  'Northern Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province'
]

export const COURSE_SLUGS = {
  forklift: 'forklift',
  excavator: 'excavator',
  backhoe: 'backhoe-loader',
} as const

export const INSTITUTE_INFO = {
  fullName: 'Imasha International Training Institute (Pvt) Ltd',
  shortName: 'IITI',
  address: '673/15, Arawwala, Pannipitiya, Sri Lanka',
  telephone: '0113 482 555',
  mobile: '070 375 5455',
  tvecRegNo: 'P01/1003',
  isoNumber: '1224Q503425',
  email: 'info@iiti.lk',
  tagline: 'Train Today. Operate Tomorrow.',
} as const

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  front_desk: 'Front Desk',
  student: 'Student',
}

export const GRADE_COLORS: Record<string, string> = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-blue-100 text-blue-800',
  C: 'bg-yellow-100 text-yellow-800',
  D: 'bg-orange-100 text-orange-800',
  F: 'bg-red-100 text-red-800',
  Pass: 'bg-green-100 text-green-800',
  Fail: 'bg-red-100 text-red-800',
  Distinction: 'bg-purple-100 text-purple-800',
}
