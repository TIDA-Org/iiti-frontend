import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-stone-100 text-stone-600',
  suspended: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-stone-100 text-stone-600',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  waived: 'bg-purple-100 text-purple-800',
  upcoming: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-red-100 text-red-800',
  published: 'bg-green-100 text-green-800',
  draft: 'bg-stone-100 text-stone-600',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const color = statusColors[status.toLowerCase()] ?? 'bg-stone-100 text-stone-600'
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', color, className)}>
      {status.replace('_', ' ')}
    </span>
  )
}
