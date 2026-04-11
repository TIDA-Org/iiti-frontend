import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

interface RestrictedAccessProps {
  title?: string
  message?: string
  backHref?: string
  backLabel?: string
}

export function RestrictedAccess({
  title = 'Restricted Access',
  message = 'You do not have permission to view this page.',
  backHref = '/admin/dashboard',
  backLabel = 'Back to Dashboard',
}: RestrictedAccessProps) {
  return (
    <div className="bg-white border border-rose-200 rounded-xl p-6">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-4 h-4 text-rose-500" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-rose-700">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{message}</p>
          <Link
            href={backHref}
            className="inline-block mt-4 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            {backLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
