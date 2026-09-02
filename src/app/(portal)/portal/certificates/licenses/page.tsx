'use client'

import { useApi } from '@/hooks/useApi'
import { DataLoader } from '@/components/shared/DataLoader'
import { formatDate } from '@/lib/utils'
import { apiGetMyLicenses } from '@/lib/api/licenses'
import { ShieldCheck, ShieldAlert, Camera, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PortalLicensesPage() {
  const { data: licensesData, isLoading, error } = useApi(
    () => apiGetMyLicenses(1, 20),
    []
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>My Operator Licenses</h1>
        <p className="text-stone-500 text-sm mt-1">View your issued operator licenses and QR cards</p>
      </div>

      {/* Photo Requirement Notice */}
      <div className="mb-6 bg-orange-50 border border-orange-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-800">Operator License Photo Requirement</h4>
            <p className="text-xs text-stone-600">License generation requires an approved passport-style photo submitted via your profile.</p>
          </div>
        </div>
        <Link
          href="/portal/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors shrink-0"
        >
          Manage License Photo <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <DataLoader isLoading={isLoading} error={error}>
        {!licensesData || licensesData.items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-slate-800 mb-1">No Licenses Found</h3>
            <p className="text-slate-500">You do not have any operator licenses associated with your account.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {licensesData.items.map((lic) => (
              <div key={lic.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className={`p-4 border-b ${lic.is_revoked ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    {lic.is_revoked ? <ShieldAlert className="w-5 h-5 text-red-500" /> : <ShieldCheck className="w-5 h-5 text-green-500" />}
                    <span className="font-semibold text-slate-800">{lic.license_number}</span>
                  </div>
                  {lic.is_revoked ? (
                    <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 font-medium">Revoked</span>
                  ) : lic.status === 'generated' ? (
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 font-medium">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded bg-slate-200 text-slate-700 font-medium uppercase tracking-wide">{lic.status}</span>
                  )}
                </div>
                
                <div className="p-5 flex-1">
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 mb-1">Vehicle Category</p>
                    <p className="font-medium text-slate-800">{lic.vehicle_type}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Issue Date</p>
                      <p className="text-sm font-medium text-slate-800">{lic.issue_date ? formatDate(lic.issue_date) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Expiry Date</p>
                      <p className="text-sm font-medium text-slate-800">{lic.expiry_date ? formatDate(lic.expiry_date) : '—'}</p>
                    </div>
                  </div>

                  {lic.is_revoked && lic.revoke_reason && (
                    <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100 mb-4">
                      <strong>Reason for revocation:</strong> {lic.revoke_reason}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                  {lic.license_card_url && (
                    <a 
                      href={lic.license_card_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 text-center py-2 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-amber-400 hover:text-amber-600 transition-colors"
                    >
                      Front Card
                    </a>
                  )}
                  {lic.license_pdf_url && (
                    <a 
                      href={lic.license_pdf_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex-1 text-center py-2 px-4 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:border-amber-400 hover:text-amber-600 transition-colors"
                    >
                      Back Card
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DataLoader>
    </div>
  )
}
