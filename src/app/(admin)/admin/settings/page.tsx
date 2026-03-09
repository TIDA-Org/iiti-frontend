import { PageHeader } from '@/components/admin/layout/PageHeader'
import { INSTITUTE_INFO } from '@/lib/constants'

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" subtitle="Institute configuration (Super Admin only)" />
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-slate-700 mb-4">Institute Information</h3>
          <div className="grid gap-4">
            {[
              { label: 'Full Name', value: INSTITUTE_INFO.fullName },
              { label: 'Short Name', value: INSTITUTE_INFO.shortName },
              { label: 'Address', value: INSTITUTE_INFO.address },
              { label: 'Telephone', value: INSTITUTE_INFO.telephone },
              { label: 'Mobile', value: INSTITUTE_INFO.mobile },
              { label: 'Email', value: INSTITUTE_INFO.email },
              { label: 'TVEC Reg No', value: INSTITUTE_INFO.tvecRegNo },
              { label: 'ISO Certificate', value: INSTITUTE_INFO.isoNumber },
            ].map(item => (
              <div key={item.label} className="flex gap-4 py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-400 w-36 flex-shrink-0">{item.label}</span>
                <span className="text-sm font-medium text-slate-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400">To update institute information, please contact the system administrator.</p>
      </div>
    </div>
  )
}
