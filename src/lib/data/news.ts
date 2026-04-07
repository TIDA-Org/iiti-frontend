export interface NewsItem {
  id: string
  title: string
  summary: string
  content: string
  image?: string
  publishedAt: string
  category: 'announcement' | 'news' | 'event'
}

export const NEWS: NewsItem[] = [
  {
    id: 'news1',
    title: 'April 2025 Intake Now Open',
    summary: 'Applications are now open for the April 2025 training batch for all three programmes.',
    content: 'Imasha International Training Institute is pleased to announce that applications are now open for the April 2025 intake. All three programmes — Forklift, Excavator, and Backhoe Loader — are available.',
    publishedAt: '2025-03-01T00:00:00Z',
    category: 'announcement',
  },
  {
    id: 'news2',
    title: 'IITI Graduates Secure International Placements',
    summary: '15 IITI graduates have secured employment in the UAE and Qatar through our job placement programme.',
    content: 'We are proud to announce that 15 of our recent graduates have successfully secured employment in the United Arab Emirates and Qatar through the IITI Job Placement Programme.',
    publishedAt: '2025-02-15T00:00:00Z',
    category: 'news',
  },
  {
    id: 'news3',
    title: 'ISO 9001:2015 Recertification Completed',
    summary: 'IITI has successfully completed its ISO 9001:2015 recertification audit, maintaining its quality management certification.',
    content: 'IITI has successfully completed its annual ISO 9001:2015 recertification audit. Certificate No. 1224Q503425 has been renewed, confirming our commitment to quality training standards.',
    publishedAt: '2025-01-20T00:00:00Z',
    category: 'news',
  },
]
