import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  iconColor?: string
  iconBg?: string
}

export function KpiCard({ title, value, subtitle, icon: Icon, trend, iconColor = 'text-amber-500', iconBg = 'bg-amber-50' }: KpiCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', isPositive ? 'text-green-600' : 'text-red-500')}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>{value}</div>
      <div className="text-sm text-slate-500 font-medium">{title}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      {trend && <div className="text-xs text-slate-400 mt-1">{trend.label}</div>}
    </div>
  )
}
