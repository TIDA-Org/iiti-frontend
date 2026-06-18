'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import AccreditationPdfPreview from '@/components/AccreditationPdfPreview'

import { apiGetPublicAccreditationDocuments, type AccreditationDocumentLink } from '@/lib/api/settings'

export default function IsoAccreditationPage() {
  const [document, setDocument] = useState<AccreditationDocumentLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await apiGetPublicAccreditationDocuments()
        setDocument(data.iso_document || null)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ISO document')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  return (
    <section className="py-16 sm:py-20 bg-linear-to-b from-white via-slate-50 to-white min-h-[70vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">ISO Certification Document</h1>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Official supporting document for ISO certification.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading document...</div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {!isLoading && !error && !document?.url && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900">No ISO document available</h2>
            <p className="mt-2 text-sm text-slate-600">Please check back later.</p>
          </div>
        )}

        {!isLoading && !error && document?.url && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-4xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">{document.original_name || 'ISO Certification Document'}</h2>

            <AccreditationPdfPreview
              url={
                document.object_key
                  ? `/api/backend/settings/public/accreditation-file?object_key=${encodeURIComponent(
                      document.object_key,
                    )}`
                  : document.url
              }
              alt={document.original_name || 'ISO Certification Document'}
              heightClassName="h-[42rem] sm:h-[80rem]"
            />

            <p className="mt-3 text-sm text-slate-600">Preview only — no direct download or new tab.</p>
          </div>
        )}
      </div>
    </section>
  )
}
