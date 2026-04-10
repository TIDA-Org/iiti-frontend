'use client'

import { apiGetCertificates, CertificateListApiResponse, CertificateApiResponse } from '@/lib/api'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export default function AdminCertificatesPage() {
  const { data, isLoading, error, refetch } = useApi<CertificateListApiResponse>(
    () => apiGetCertificates(1, 100),
    [],
  )

  const certs = data?.items || []
  const certTypeLabel: Record<string, string> = { full: 'Institute', participation: 'Participation', skill_id: 'Skill ID', nvq: 'NVQ L3' }

  return (
    <div>
      <PageHeader title="Certificates" subtitle={data ? `${data.total} certificates issued` : 'Loading...'} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                      <Link href={`/admin/certificates/${cert.id}`} className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
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
