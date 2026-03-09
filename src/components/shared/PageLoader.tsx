import { LoadingSpinner } from './LoadingSpinner'

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-stone-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
