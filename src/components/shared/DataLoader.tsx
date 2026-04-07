'use client'

import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'

interface DataLoaderProps {
  isLoading: boolean
  error: string | null
  onRetry?: () => void
  children: React.ReactNode
  skeleton?: React.ReactNode
}

export function DataLoader({ isLoading, error, onRetry, children, skeleton }: DataLoaderProps) {
  if (isLoading) {
    return skeleton || (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <AlertCircle className="w-8 h-8 text-red-400" />
        <p className="text-sm text-slate-500">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium border border-amber-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    )
  }

  return <>{children}</>
}
