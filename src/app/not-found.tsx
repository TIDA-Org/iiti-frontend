import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-orange-500 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>404</div>
        <h1 className="text-2xl font-bold text-stone-800 mb-2">Page Not Found</h1>
        <p className="text-stone-500 mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-md font-semibold transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}
