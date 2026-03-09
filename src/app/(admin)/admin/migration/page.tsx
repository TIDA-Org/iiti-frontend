import { PageHeader } from '@/components/admin/layout/PageHeader'
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react'

export default function AdminMigrationPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="Data Migration" subtitle="Excel import tool (Super Admin only)" />
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center mb-6">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium mb-1">Upload Excel File</p>
          <p className="text-slate-400 text-sm mb-4">Drag and drop or click to browse</p>
          <button className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 mx-auto">
            <Upload className="w-4 h-4" /> Select File
          </button>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-1">Before importing</p>
            <p className="text-xs text-amber-700">Download the template, fill in student data, then upload. This will create student records in bulk. Review the preview before confirming.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
