'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, FileText } from 'lucide-react'
import AccreditationPdfPreview from '@/components/AccreditationPdfPreview'

import { apiGetPublicAccreditationDocuments, type AccreditationDocumentLink } from '@/lib/api/settings'

export default function TvecAccreditationPage() {
  const [documents, setDocuments] = useState<AccreditationDocumentLink[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await apiGetPublicAccreditationDocuments()
        const validDocs = (data.tvec_documents || []).filter((doc) => Boolean(doc.url))
        setDocuments(validDocs)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load TVEC documents')
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">TVEC Accreditation Documents</h1>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Official supporting documents related to our TVEC registration and accreditation status.
          </p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading documents...</div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-slate-900">No TVEC documents available</h2>
            <p className="mt-2 text-sm text-slate-600">Please check back later.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {documents.map((doc, index) => (
            <div key={`${doc.object_key}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">{doc.original_name || `TVEC Document ${index + 1}`}</h2>

              {doc.object_key ? (
                <AccreditationPdfPreview url={`/api/backend/settings/public/accreditation-file?object_key=${encodeURIComponent(
                  doc.object_key,
                )}`} alt={doc.original_name || `TVEC Document ${index + 1}`} heightClassName="h-[28rem] sm:h-[54rem]" />
              ) : doc.url ? (
                <AccreditationPdfPreview
                  url={doc.url}
                  alt={doc.original_name || `TVEC Document ${index + 1}`}
                  heightClassName="h-[28rem] sm:h-[54rem]"
                />
              ) : (
                <div className="rounded-md border border-slate-100 p-6 text-center text-slate-500">No preview available</div>
              )}

              <p className="mt-3 text-sm text-slate-600">Preview only — no direct download or new tab.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
