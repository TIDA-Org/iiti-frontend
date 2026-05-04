'use client'

import { useMemo, useState } from 'react'
import {
  apiGetCertificates,
  CertificateApiResponse,
  CertificateListApiResponse,
} from '@/lib/api/certificates'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Eye } from 'lucide-react'

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState('')
  
  const { data, isLoading, error, refetch } = useApi<CertificateListApiResponse>(
    () => apiGetCertificates(1, 100),
    [],
  )

  const certs = useMemo(() => {
    const list = data?.items || []
    if (!search.trim()) return list
    const lowerSearch = search.toLowerCase()
    return list.filter((cert) =>
      cert.certificate_number?.toLowerCase().includes(lowerSearch) ||
      cert.cert_subtype?.toLowerCase().includes(lowerSearch)
    )
  }, [data?.items, search])
  const certTypeLabel: Record<string, string> = { full: 'Institute', participation: 'Participation', skill_id: 'Skill ID', nvq: 'NVQ L3' }

  return (
    <div>
      <PageHeader title="Certificates" subtitle={data ? `${data.total} certificates issued` : 'Loading...'} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by certificate number or subtype..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{certs.length} results</span>
        </div>
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Certificate No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Subtype</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Issued</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {certs.map((cert: CertificateApiResponse) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-xs text-amber-600 font-medium">{cert.certificate_number}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{certTypeLabel[cert.cert_subtype] || cert.cert_subtype}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{cert.issue_date ? formatDate(cert.issue_date) : '-'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={cert.is_revoked ? 'inactive' : 'active'} />
                    </td>
                    <td className="px-5 py-3">
                      {cert.certificate_pdf_url ? (
                        <a
                          href={cert.certificate_pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-slate-300 font-medium cursor-not-allowed" title="Certificate PDF is not available">
                          <Eye className="w-3.5 h-3.5" /> View
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {certs.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">No certificates found.</div>
            )}
          </div>
        </DataLoader>
      </div>
    </div>
  )
}
