'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  apiGetCertificates,
  apiRecreateCertificate,
  CertificateApiResponse,
  CertificateListApiResponse,
} from '@/lib/api/certificates'
import { useApi } from '@/hooks/useApi'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { DataLoader } from '@/components/shared/DataLoader'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate } from '@/lib/utils'
import { Eye, Loader2, MoreVertical, RotateCcw } from 'lucide-react'
import { getProxiedCertificateUrl } from '@/lib/utils/download'
import { toast } from 'sonner'

export default function AdminCertificatesPage() {
  const [search, setSearch] = useState('')
  const [recreatingId, setRecreatingId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  
  const { data, isLoading, error, refetch } = useApi<CertificateListApiResponse>(
    () => apiGetCertificates(1, 100),
    [],
  )

  useEffect(() => {
    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return
      if (!event.target.closest('[data-certificate-menu]')) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleDocumentMouseDown)
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown)
  }, [])

  const handleRecreateCertificate = async (certificateId: string) => {
    try {
      setRecreatingId(certificateId)
      await apiRecreateCertificate(certificateId)
      toast.success('Certificate PDF regeneration started.')
      await refetch()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to recreate certificate.')
    } finally {
      setRecreatingId(null)
    }
  }

  const certs = useMemo(() => {
    const list = data?.items || []
    if (!search.trim()) return list
    const lowerSearch = search.toLowerCase()
    return list.filter((cert) =>
      cert.certificate_number?.toLowerCase().includes(lowerSearch) ||
      cert.cert_subtype?.toLowerCase().includes(lowerSearch) ||
      cert.student?.full_name?.toLowerCase().includes(lowerSearch) ||
      cert.course?.name?.toLowerCase().includes(lowerSearch) ||
      cert.student?.nic_number?.toLowerCase().includes(lowerSearch)
    )
  }, [data?.items, search])
  const certTypeLabel: Record<string, string> = { full: 'Institute', participation: 'Participation', skill_id: 'Skill ID', nvq: 'NVQ L3' }

  return (
    <div>
      <PageHeader title="Certificates" subtitle={data ? `${data.total} certificates issued` : 'Loading...'} />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search by certificate number, student, NIC, course, or subtype..." className="max-w-sm" />
          <span className="text-sm text-slate-400">{certs.length} results</span>
        </div>
        <DataLoader isLoading={isLoading} error={error} onRetry={refetch}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Certificate No</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Student Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">NIC</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase">Course</th>
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
                    <td className="px-5 py-3 text-slate-700">{cert.student?.full_name ?? 'N/A'}</td>
                    <td className="px-5 py-3 text-slate-700 font-mono">{cert.student?.nic_number ?? 'N/A'}</td>
                    <td className="px-5 py-3 text-slate-700">{cert.course?.name ?? 'N/A'}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{certTypeLabel[cert.cert_subtype] || cert.cert_subtype}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{cert.issue_date ? formatDate(cert.issue_date) : '-'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={cert.is_revoked ? 'inactive' : 'active'} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative inline-flex" data-certificate-menu>
                        {(() => {
                          const href = getProxiedCertificateUrl(cert.certificate_pdf_url, cert.id)
                          const isOpen = openMenuId === cert.id

                          return (
                            <>
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                aria-label="Certificate actions"
                                aria-expanded={isOpen}
                                onClick={() => setOpenMenuId(isOpen ? null : cert.id)}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {isOpen && (
                                <div className="absolute right-0 top-full z-20 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                                  {href ? (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                                      onClick={() => setOpenMenuId(null)}
                                    >
                                      <Eye className="h-4 w-4" />
                                      View PDF
                                    </a>
                                  ) : (
                                    <span className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300">
                                      <Eye className="h-4 w-4" />
                                      View PDF unavailable
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                                    onClick={async () => {
                                      setOpenMenuId(null)
                                      await handleRecreateCertificate(cert.id)
                                    }}
                                    disabled={recreatingId === cert.id}
                                  >
                                    {recreatingId === cert.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <RotateCcw className="h-4 w-4" />
                                    )}
                                    {recreatingId === cert.id ? 'Creating...' : 'Create certificate'}
                                  </button>
                                </div>
                              )}
                            </>
                          )
                        })()}
                      </div>
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
