'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'

export default function AdminNewCoursePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await delay(800)
    setIsLoading(false)
    toast.success('Course created successfully!')
    router.push('/admin/courses')
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Add New Course" subtitle="Create a training programme" />
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Course Name *</label><input className={inputClass} required /></div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Course Code *</label><input className={inputClass} required /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Duration (weeks)</label><input type="number" className={inputClass} /></div>
            <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Fee (LKR)</label><input type="number" className={inputClass} /></div>
          </div>
          <div><label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Description</label><textarea rows={3} className={inputClass + ' resize-none'} /></div>
          <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
            {isLoading ? 'Creating...' : 'Create Course'}
          </button>
        </form>
      </div>
    </div>
  )
}
