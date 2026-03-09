import { Vacancy } from '@/types/vacancy'

export const MOCK_VACANCIES: Vacancy[] = [
  {
    id: 'v1', title: 'Forklift Operator', company: 'Lanka Logistics Ltd',
    location: 'Colombo Port', description: 'We are looking for a certified forklift operator to join our warehouse team. Must have NVQ Level 3 certification and at least 1 year experience.',
    qualifications: ['NVQ Level 3 Certificate', 'Minimum 1 year experience', 'Valid Skill ID Card', 'Good physical fitness'],
    requiredCourses: ['c1'], salaryRange: 'LKR 45,000 - 60,000',
    deadline: '2025-04-30T00:00:00Z', isPublished: true, isInternational: false,
    postedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'v2', title: 'Excavator Operator', company: 'RoadCon Construction (Pvt) Ltd',
    location: 'Kurunegala', description: 'Join our construction team as an excavator operator. Must be certified and able to work on road construction projects.',
    qualifications: ['NVQ Level 3 Certificate', 'Minimum 2 years experience', 'Clean driving record', 'Ability to work outdoors'],
    requiredCourses: ['c2'], salaryRange: 'LKR 55,000 - 75,000',
    deadline: '2025-05-15T00:00:00Z', isPublished: true, isInternational: false,
    postedAt: '2025-03-02T00:00:00Z',
  },
  {
    id: 'v3', title: 'Heavy Equipment Operator', company: 'Gulf Construction LLC',
    location: 'Dubai, UAE', description: 'International opportunity for certified heavy equipment operators in Dubai. 2-year contract with accommodation and flights included.',
    qualifications: ['NVQ Level 3 Certificate', 'Minimum 3 years experience', 'Valid passport', 'Medical fitness certificate'],
    requiredCourses: ['c1', 'c2', 'c3'], salaryRange: 'AED 3,500 - 5,000/month',
    deadline: '2025-04-15T00:00:00Z', isPublished: true, isInternational: true, country: 'UAE',
    postedAt: '2025-03-03T00:00:00Z',
  },
]
