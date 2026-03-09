export interface Course {
  id: string
  code: string
  name: string
  slug: string
  description: string
  duration: string
  durationWeeks: number
  fee: number
  image?: string
  isActive: boolean
  tvecRegistered: boolean
  nvqLevel: number
  createdAt: string
}

export interface CourseOutlineWeek {
  week: number
  title: string
  topics: string[]
}
