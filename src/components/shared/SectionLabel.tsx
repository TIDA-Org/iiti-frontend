import { cn } from '@/lib/utils'

interface SectionLabelProps {
  children: React.ReactNode
  className?: string
  light?: boolean
}

export function SectionLabel({ children, className, light = false }: SectionLabelProps) {
  return (
    <div className={cn('inline-flex items-center gap-2 mb-3', className)}>
      <div className={cn('w-8 h-0.5', light ? 'bg-orange-300' : 'bg-orange-500')} />
      <span
        className={cn(
          'text-xs font-semibold uppercase tracking-widest',
          light ? 'text-orange-300' : 'text-orange-500'
        )}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {children}
      </span>
    </div>
  )
}
