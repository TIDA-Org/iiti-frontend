export interface Vacancy {
  id: string
  title: string
  company: string
  location: string
  description: string
  qualifications: string[]
  requiredCourses: string[]
  salaryRange?: string
  deadline: string
  isPublished: boolean
  isInternational: boolean
  country?: string
  postedAt: string
  image?: string
  contactEmail?: string
  contactPhone?: string
}

export interface JobApplication {
  id: string
  vacancyId: string
  studentId: string
  appliedAt: string
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired'
  message?: string
}
