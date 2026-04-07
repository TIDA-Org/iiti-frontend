'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/admin/layout/PageHeader'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { apiGetStudents, StudentApiResponse } from '@/lib/api'

const schema = z.object({
  studentId: z.string().min(1),
  amount: z.string().min(1),
  method: z.enum(['cash', 'bank_transfer', 'online']),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function AdminRecordPaymentPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<StudentApiResponse[]>([])
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    apiGetStudents(1, 100).then(res => setStudents(res.items)).catch(() => {})
  }, [])

  const onSubmit = async () => {
    setIsLoading(true)
    // TODO: call payment recording API when backend is implemented
    setIsLoading(false)
    toast.info('Payment recording is not yet available.')
  }

  const inputClass = "w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"

  return (
    <div className="max-w-lg">
      <PageHeader title="Record Payment" subtitle="Manual payment entry" />
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Student *</label>
            <select {...register('studentId')} className={inputClass}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.student_id})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Amount (LKR) *</label>
            <input {...register('amount')} type="number" placeholder="0" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Payment Method *</label>
            <select {...register('method')} className={inputClass}>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Notes</label>
            <textarea {...register('notes')} rows={3} className={inputClass + ' resize-none'} />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
            {isLoading ? 'Recording...' : 'Record Payment'}
          </button>
        </form>
      </div>
    </div>
  )
}
