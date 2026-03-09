import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-stone-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-700 mb-2">{title}</h3>
      {description && <p className="text-stone-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
