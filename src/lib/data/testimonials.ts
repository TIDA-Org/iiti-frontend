export interface Testimonial {
  id: string
  name: string
  role: string
  location: string
  quote: string
  rating: number
  course: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Kasun Perera',
    role: 'Forklift Operator',
    location: 'Colombo',
    quote: 'After completing the Forklift Training at IITI, I secured a position at a leading logistics company within two weeks. The quality of training is unmatched.',
    rating: 5,
    course: 'Forklift Operator Training',
  },
  {
    id: 't2',
    name: 'Nimal Rajapaksa',
    role: 'Excavator Operator',
    location: 'Kurunegala',
    quote: 'The NVQ Level 3 certificate I received from IITI opened doors for me internationally. I am now working in Qatar and earning much more than I expected.',
    rating: 5,
    course: 'Excavator Operator Training',
  },
  {
    id: 't3',
    name: 'Pradeep Bandara',
    role: 'Heavy Equipment Operator',
    location: 'Kandy',
    quote: 'Excellent training facilities and highly experienced instructors. The practical training prepared me well for real-world construction site operations.',
    rating: 5,
    course: 'Backhoe Loader Training',
  },
  {
    id: 't4',
    name: 'Sunil Weerasinghe',
    role: 'Site Supervisor',
    location: 'Gampaha',
    quote: 'I recommend IITI to anyone looking for quality vocational training. The institute\'s reputation helped me get hired immediately after completing my course.',
    rating: 4,
    course: 'Forklift Operator Training',
  },
]
