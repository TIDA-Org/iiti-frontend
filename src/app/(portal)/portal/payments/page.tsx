'use client'

import { useState } from 'react'
import { MOCK_PAYMENTS } from '@/lib/mock-data/payments'
import { MOCK_ENROLLMENTS } from '@/lib/mock-data/enrollments'
import { MOCK_COURSES } from '@/lib/mock-data/courses'
import { formatLKR, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { toast } from 'sonner'
import { delay } from '@/lib/utils'
import { CreditCard, Download } from 'lucide-react'

export default function PortalPaymentsPage() {
  const [paying, setPaying] = useState(false)
  const payments = MOCK_PAYMENTS.filter(p => p.studentId === 's1')
  const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)
  const enrollment = MOCK_ENROLLMENTS.find(e => e.studentId === 's1')
  const course = MOCK_COURSES.find(c => c.id === enrollment?.courseId)
  const total = course?.fee || 0

  const handlePayNow = async () => {
    setPaying(true)
    await delay(1200)
    setPaying(false)
    toast.success('Payment simulation complete! In production, this redirects to PayHere.')
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Payments</h1>
        <p className="text-stone-500 text-sm mt-1">Your payment history and upcoming dues</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-stone-200 p-4">
          <p className="text-xs text-stone-400 mb-1">Total Course Fee</p>
          <p className="text-xl font-bold text-stone-800">{formatLKR(total)}</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-4 bg-green-50">
          <p className="text-xs text-stone-400 mb-1">Amount Paid</p>
          <p className="text-xl font-bold text-green-600">{formatLKR(paid)}</p>
        </div>
        <div className="bg-white rounded-xl border border-orange-200 p-4 bg-orange-50">
          <p className="text-xs text-stone-400 mb-1">Outstanding Balance</p>
          <p className="text-xl font-bold text-orange-600">{formatLKR(pending)}</p>
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-stone-100">
          <h3 className="font-semibold text-stone-700">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Receipt No</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Method</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {payments.map(p => (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="px-5 py-3 font-mono text-xs text-stone-600">{p.receiptNo}</td>
                  <td className="px-5 py-3 font-semibold text-stone-800">{formatLKR(p.amount)}</td>
                  <td className="px-5 py-3 text-stone-500 capitalize">{p.method.replace('_', ' ')}</td>
                  <td className="px-5 py-3 text-stone-500">{p.paidAt ? formatDate(p.paidAt) : p.dueDate ? `Due: ${formatDate(p.dueDate)}` : '-'}</td>
                  <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-5 py-3">
                    {p.status === 'paid' && (
                      <button onClick={() => toast.info('Receipt download simulated')} className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600">
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pending > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-stone-800">Outstanding Balance: {formatLKR(pending)}</p>
            <p className="text-sm text-stone-500 mt-0.5">Make a payment to keep your enrollment active.</p>
          </div>
          <button
            onClick={handlePayNow}
            disabled={paying}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
          >
            {paying ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : <><CreditCard className="w-4 h-4" /> Pay Now</>}
          </button>
        </div>
      )}
    </div>
  )
}
