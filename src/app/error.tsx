'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center px-4">
        <div className="text-6xl font-bold text-red-500 mb-4">!</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Something went wrong</h1>
        <p className="text-stone-500 mb-8">{error.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={reset}
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
