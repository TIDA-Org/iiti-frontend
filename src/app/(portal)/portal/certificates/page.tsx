'use client'

import { useEffect, useState } from 'react'
import { apiGetMyCertificates, CertificateApiResponse } from '@/lib/api'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { Award, Download, QrCode } from 'lucide-react'
import { toast } from 'sonner'

export default function PortalCertificatesPage() {
  const [certs, setCerts] = useState<CertificateApiResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCerts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiGetMyCertificates(1, 100)
      setCerts(data.items.filter(c => !c.is_revoked))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load certificates')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchCerts() }, [])

  const certTypeLabel: Record<string, string> = {
    institute: 'Institute Certificate',
    skill_id: 'Skill ID Card',
    nvq: 'NVQ Level 3',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Certificates</h1>
        <p className="text-stone-500 text-sm mt-1">Your issued certificates and QR verification codes</p>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={fetchCerts}>
        {certs.length === 0 ? (
          <EmptyState icon={Award} title="No certificates yet" description="Certificates will be issued after successful course completion." />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certs.map(cert => {
              const verifyUrl = cert.qr_code_url || `${window.location.origin}/verify/${cert.id}`
              return (
                <div key={cert.id} className="bg-white rounded-xl border border-stone-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                        {certTypeLabel[cert.subtype] || cert.subtype}
                      </span>
                      <h3 className="font-semibold text-stone-800">Certificate</h3>
                      <p className="text-xs text-stone-400 mt-1 font-mono">{cert.certificate_number}</p>
                      <p className="text-xs text-stone-400">Issued: {formatDate(cert.issue_date)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-stone-100">
                    {cert.certificate_url && (
                      <a
                        href={cert.certificate_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                    <button
                      onClick={() => {navigator.clipboard.writeText(verifyUrl); toast.success('Verification link copied!')}}
                      className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" /> Copy Verify Link
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </DataLoader>
    </div>
  )
}
