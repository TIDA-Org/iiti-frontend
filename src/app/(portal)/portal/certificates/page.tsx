'use client'

import { useEffect, useState } from 'react'
import { apiGetMyCertificates, CertificateApiResponse } from '@/lib/api/certificates'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/shared/EmptyState'
import { Award, Download, QrCode } from 'lucide-react'
import { toast } from 'sonner'
import { getProxiedCertificateUrl } from '@/lib/utils/download'

import { useTranslation } from '@/lib/i18n/useTranslation'

export default function PortalCertificatesPage() {
  const { t } = useTranslation()
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
    institute: t.certificates.certInstitute,
    skill_id: t.certificates.certSkillId,
    nvq: t.certificates.certNvq,
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.certificates.title}</h1>
        <p className="text-stone-500 text-sm mt-1">{t.certificates.subtitle}</p>
      </div>

      <DataLoader isLoading={isLoading} error={error} onRetry={fetchCerts}>
        {certs.length === 0 ? (
          <EmptyState icon={Award} title={t.certificates.emptyTitle} description={t.certificates.emptyDesc} />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certs.map(cert => {
              const verifyUrl = cert.qr_code_image_url || `${window.location.origin}/verify/${cert.id}`
              return (
                <div key={cert.id} className="bg-white rounded-xl border border-stone-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                        {certTypeLabel[cert.cert_subtype] || cert.cert_subtype}
                      </span>
                      <h3 className="font-semibold text-stone-800">{t.certificates.certificate}</h3>
                      <p className="text-xs text-stone-400 mt-1 font-mono">{cert.certificate_number}</p>
                      <p className="text-xs text-stone-400">{t.certificates.issued}: {cert.issue_date ? formatDate(cert.issue_date) : '-'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3 border-t border-stone-100">
                    {(() => {
                      const href = getProxiedCertificateUrl(cert.certificate_pdf_url, cert.id)
                      return href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-700 border border-stone-200 hover:border-stone-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> {t.common.download}
                        </a>
                      ) : null
                    })()}
                    <button
                      onClick={() => {navigator.clipboard.writeText(verifyUrl); toast.success(t.certificates.verifyLinkCopied)}}
                      className="flex items-center gap-1.5 text-xs text-orange-500 hover:text-orange-600 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" /> {t.certificates.copyVerifyLink}
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
